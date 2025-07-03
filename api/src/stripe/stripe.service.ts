import { BadRequestException, Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { formatearARS } from "src/utils/formatters";


const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    throw new Error('La clave secreta de Stripe (STRIPE_SECRET_KEY) no está definida en .env');
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-05-28.basil', 
});

@Injectable()
export class StripeService {

    private readonly tasaCambioARSUSD = 0.000819;
    

    async crearCheckoutSession(
        montoARS: number,  // monto en ARS
        casoId: string, 
        usuarioId: string,
        organizacionId: string,
        mascotaId: string,
        titulo: string,
        descripcion: string,
    ) {

    const tasa = this.tasaCambioARSUSD;
    const montoUSD = montoARS * tasa;
    const montoCentavosUSD = Math.round(montoUSD * 100);
    

    if (montoCentavosUSD < 50) {
        const minimoARS = Math.ceil(0.50 / tasa);
        throw new BadRequestException(`El monto en USD debe ser al menos $0.50. Para cumplir con este mínimo, debes donar al menos ${minimoARS} ARS.`);
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        line_items: [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                name: `Donación: ${titulo} (${formatearARS(montoARS)} ARS)`,
                description: descripcion.length > 100 ? descripcion.slice(0, 100) + '...' : descripcion,
                },  
                unit_amount: montoCentavosUSD,
            },
            quantity: 1,
        },
        ],
        metadata: {
            casoId,
            usuarioId,
            organizacionId,
            mascotaId,
            montoARS: montoARS.toFixed(2),
            montoARSFormateado: formatearARS(montoARS),
            tasaCambio: tasa.toFixed(6),
            montoUSD: montoUSD.toFixed(2),
        },
        });
        
    return session.url;
    }
}
