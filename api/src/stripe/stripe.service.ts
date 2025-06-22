import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    throw new Error('La clave secreta de Stripe (STRIPE_SECRET_KEY) no está definida en .env');
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-05-28.basil', 
});

@Injectable()
export class StripeService {
    async crearCheckoutSession(
        monto: number, 
        casoId: string, 
        usuarioId: string,
        organizacionId: string,
        mascotaId: string,
    ) {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `http://localhost:3002/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3002/cancel`,
        line_items: [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                name: `Donación al caso ${casoId}`,
                },  
                unit_amount: Math.round(monto * 100), // Stripe trabaja en centavos
            },
            quantity: 1,
        },
        ],
        metadata: {
            casoId,
            usuarioId,
            organizacionId,
            mascotaId,
        },
        });
    return session.url;
    }
}
