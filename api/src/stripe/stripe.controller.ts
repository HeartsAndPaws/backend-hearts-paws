import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    Headers,
    HttpStatus,
    BadRequestException,
    NotFoundException,
    Query,
    UseGuards
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request, Response } from 'express';
import { stripe } from './stripe.service';
import Stripe from 'stripe';
import { formatearARS } from 'src/utils/formatters';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiBody,
    ApiHeaders
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticateRequest } from 'src/common/interfaces/authenticated-request.interface';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly prisma: PrismaService,
    ) {}

    @UseGuards(AuthGuard(['jwt-local', 'supabase']))
    @Get('checkout')
    @ApiOperation({ summary: 'Crea una sesión de pago para donar a un caso' })
    @ApiQuery({ name: 'casoId', type: 'string', required: true, description: 'ID del caso de donación' })
    @ApiQuery({ name: 'monto', type: 'string', required: true, description: 'Monto de la donación (ARS)' })
    @ApiResponse({
        status: 200,
        description: 'URL de Stripe Checkout para procesar el pago',
        schema: { example: { url: 'https://checkout.stripe.com/pay/cs_test_...' } }
    })
    @ApiResponse({ status: 400, description: 'Parámetros inválidos o monto inválido' })
    @ApiResponse({ status: 404, description: 'Caso de donación no encontrado' })
    async crearCheckout(
        @Query('casoId') casoId: string,
        @Query('monto') montoStr: string,
        @Req() req: AuthenticateRequest,
    ) {
        const usuarioId = req.user.id;

        const monto = parseFloat(montoStr);
        if (!usuarioId || isNaN(monto) || monto <= 0) {
            throw new BadRequestException('Parámetros inválidos para donación')
        }

        const casoDonacion = await this.prisma.casoDonacion.findUnique({
            where: { casoId },
            include: {
                caso: {
                    include: {
                        mascota: true,
                        ong: true,
                    },
                },
            },
        });

        if (!casoDonacion || !casoDonacion.caso) {
            throw new NotFoundException('Caso de donación no encontrado');
        }

        const { metaDonacion, estadoDonacion } = casoDonacion;
        const restante = metaDonacion - estadoDonacion;

        if (restante <= 0) {
            throw new BadRequestException('Este caso ya alcanzó su meta');
        }

        if (monto > restante) {
            throw new BadRequestException(`El monto excede el objetivo restante ${restante}`);
        }

        const caso = casoDonacion.caso;

        const url = await this.stripeService.crearCheckoutSession(
            monto,
            casoId,
            usuarioId,
            caso.ong?.id || '',
            caso.mascota?.id || '',
            caso.titulo,
            caso.descripcion || '',
        );

        return { url };
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Endpoint para eventos webhook de Stripe (no requiere autenticación)' })
    @ApiHeaders([
        { name: 'stripe-signature', description: 'Firma de Stripe para validar el webhook', required: true }
    ])
    @ApiBody({
        description: 'Evento enviado por Stripe (raw)',
        schema: { type: 'object', example: {} }
    })
    @ApiResponse({ status: 200, description: 'Evento recibido correctamente', schema: { example: { received: true } } })
    @ApiResponse({ status: 400, description: 'Webhook Error o metadatos incompletos' })
    @ApiResponse({ status: 404, description: 'Caso de donación no encontrado' })
    async handleWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('stripe-signature') signature: string,
    ) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret!,
            );
        } catch (err: any) {
            console.error('Webhook error:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log('📩 Evento recibido de Stripe:', event.type);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const { casoId, usuarioId, organizacionId, mascotaId } = session.metadata || {};
            const montoARS = parseFloat(session.metadata?.montoARS ?? '0');

            if (!casoId || !usuarioId || !organizacionId || !mascotaId) {
                return res.status(400).send('⚠️ Faltan metadatos en la sesión');
            }

            const donacionExistente = await this.prisma.donacion.findUnique({
                where: { comprobante: session.id },
            });

            if (donacionExistente) {
                console.log('🔁 Webhook ya procesado');
                return res.status(HttpStatus.OK).json({ received: true });
            }

            const casoDonacion = await this.prisma.casoDonacion.findUnique({
                where: { casoId }
            })

            if (!casoDonacion) {
                return res.status(404).send('⚠️ Caso no encontrado');
            }

            const nuevoTotal = casoDonacion.estadoDonacion + montoARS;

            await this.prisma.donacion.create({
                data: {
                    usuarioId,
                    organizacionId,
                    mascotaId,
                    monto: session.amount_total! / 100,
                    montoARS: montoARS,
                    tasaCambio: parseFloat(session.metadata?.tasaCambio ?? '0'),
                    comprobante: session.id,
                    estadoPago: session.payment_status ?? 'desconocido',
                    stripeSessionId: session.id,
                    referenciaPago: typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : session.payment_intent?.id ?? '',
                    casoDonacionId: casoDonacion.id,
                },
            });

            await this.prisma.casoDonacion.update({
                where: { casoId },
                data: {
                    estadoDonacion: nuevoTotal,
                    estado: nuevoTotal >= casoDonacion.metaDonacion ? 'COMPLETADO' : 'ACTIVO',
                },
            });

            console.log(`✅ Donación registrada: ${formatearARS(montoARS)} al caso ${casoId}`);
        }

        return res.status(HttpStatus.OK).json({ received: true });
    }
}
