import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {stripe} from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {

    const sig = req.headers.get('stripe-signature')!;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event

    try {
        const playload = await req.text();
        event = Stripe.webhooks.constructEvent(playload, sig, endpointSecret);
    } catch (error) {
        console.log('Error message: ', (error as Error).message);
        
        return new NextResponse(`Webhook Error: ${(error as Error).message}`, {status: 400});
    }

    switch(event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentIntentId = session.payment_intent as string;

            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
            console.log('=> PaymentIntent:', paymentIntent);


            const donateId = paymentIntent.metadata.donateId;
            try {
                const updateDonate = await prisma.donation.update({
                    where: { id: donateId },
                    data:{
                        status: 'PAID'
                    }
                });

                console.log(`Status da doação ${updateDonate.id} atualizado para ${updateDonate.status}`);
            } catch (error) {
                console.log(`## error ${error}`);
            }
            break;

            default: console.log(`evento não tratado ${event.type}`);
            
    }

    return NextResponse.json({ok: true});
}