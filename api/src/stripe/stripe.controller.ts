import {
    Controller,
    Get,
    Param,
    Post,
    Req,
    Res,
    Headers,
    HttpStatus,
    BadRequestException,
    NotFoundException,
    Query
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request, Response } from 'express';
import { stripe } from './stripe.service';
import Stripe from 'stripe';
import { Public } from '@prisma/client/runtime/library';

@Controller('stripe')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly prisma: PrismaService,
    ) {}

    @Get('checkout')
    async crearCheckout(
        @Query('casoId') casoId: string, 
        @Query('usuarioId') usuarioId: string,
        @Query('monto') montoStr: string,
    ) {
        const monto = parseFloat(montoStr);
        if (!usuarioId || isNaN(monto) || monto <= 0) {
            throw new BadRequestException('Parámetros inválidos para donación')
        }

        const casoDonacion = await this.prisma.casoDonacion.findUnique({
            where: { casoId},
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

        const url = await this.stripeService.crearCheckoutSession(
            monto,
            casoId,
            usuarioId,
            casoDonacion.caso.ong?.id || '',
            casoDonacion.caso.mascota?.id || '',
        );

        return { url };
    }

    @Post('webhook')
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
        const amount = session.amount_total! / 100;

        if (!casoId || !usuarioId || !organizacionId || !mascotaId) {
        return res.status(400).send('⚠️ Faltan metadatos en la sesión');
        }

        const donacionExistente = await this.prisma.donacion.findUnique({
            where: { comprobante: session.id},
        });

        if (donacionExistente){
            console.log('🔁 Webhook ya procesado');
            return res.status(HttpStatus.OK).json({ received: true});
        }

        const casoDonacion = await this.prisma.casoDonacion.findUnique({
            where: { casoId}
        })

        if (!casoDonacion) {
            return res.status(404).send('⚠️ Caso no encontrado');
        }

        const nuevoTotal = casoDonacion.estadoDonacion + amount;

        // Crear donación
        await this.prisma.donacion.create({
            data: {
                usuarioId,
                organizacionId,
                mascotaId,
                monto: amount,
                comprobante: session.id, 
                estadoPago: session.payment_status ?? 'desconocido',
                stripeSessionId: session.id,
                referenciaPago: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id ?? '',
                casoDonacionId: casoDonacion.id,
            },
        });

        // Actualizar total recaudado
        await this.prisma.casoDonacion.update({
            where: { casoId },
            data: {
                estadoDonacion: nuevoTotal,
                estado: nuevoTotal >= casoDonacion.metaDonacion ? 'COMPLETADO' : 'ACTIVO',
            },
        });

        console.log(`✅ Donación registrada: $${amount} al caso ${casoId}`);
        }

        return res.status(HttpStatus.OK).json({ received: true });
    }
}
