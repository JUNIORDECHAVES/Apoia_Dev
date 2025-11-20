'use server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const createPaymentSchema = z.object({
    slug: z.string().min(1, 'Slug é obrigatoria.'),
    name: z.string().min(1, 'Nome é obrigatorio.'),
    message: z.string().min(5, 'Caracteres minimas da Mensagem é 5 .'),
    price: z.number().min(10, 'Selecione um valor maior que 10.'),
    creatorId: z.string()
})

type CreatePaymentShema = z.infer<typeof createPaymentSchema>;

export async function createPayment(data: CreatePaymentShema) {

    const schema = createPaymentSchema.safeParse(data)

    if (!schema.success) {
        return{
            error: schema.error.issues[0].message
        }
    }

    if(!data.creatorId){
        return {
            error: 'Falha ao criar pagamento, tente novamente.'
        }
    }

    try {
        
        const creator = await prisma.user.findFirst({
            where:{
                conectedStripeAccountId: data.creatorId
            },
            
        })

        if(!creator){
            return {
                error: 'Falha ao criar pagamento, tente novamente.'
            }
        }

        const applicationFeeAmount = Math.floor(data.price * 0.1);

        const donate = await prisma.donation.create({
            data:{
                donorName: data.name,
                donorMesage: data.message,
                userId: creator.id,
                status: 'PENDING',
                amount: (data.price - applicationFeeAmount),
            }
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.HOST_URL}/creator/${data.slug}`,
            cancel_url: `${process.env.HOST_URL}/creator/${data.slug}`,
            line_items:[
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `Apoio ${creator.name}`,  
                        },
                        unit_amount: data.price
                    },
                    quantity: 1,
                }
            ],
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data:{
                    destination: creator.conectedStripeAccountId as string
                },
                metadata:{
                    donorName: data.name,
                    donorMessage: data.message,
                    donateId: donate.id
                }
            }
        });

        return {
            sessionId: session.id,
            url: session.url,
        }

    } catch (error) {
        return {
            error: 'Erro ao criar pagamento, tente novamente.'
        }
    }

}