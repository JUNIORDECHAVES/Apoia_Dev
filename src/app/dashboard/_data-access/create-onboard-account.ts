'use server'
import {stripe} from '@/lib/stripe';

export async function GetLoginOnboardAccount(accontId: string | undefined) {

    if(!accontId) return null;

    try {
        const accountLink = await stripe.accountLinks.create({
            account: accontId,
            refresh_url: `${process.env.HOST_URL!}/dashboard`,
            return_url: `${process.env.HOST_URL!}/dashboard`,
            type : 'account_onboarding'
        })

        return accountLink.url;

    } catch (error) {
        console.log("Erro ao criar conta de criador:", error    );
        return null;
    }

}