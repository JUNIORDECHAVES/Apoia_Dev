'use server';

import { stripe } from '@/lib/stripe';

export async function getStripeDashboard(acountId: string | undefined) {
    if(!acountId) {
        return null;
    }

    try {
        
        const loginLink =  await stripe.accounts.createLoginLink(acountId);

        return loginLink.url;
        
    } catch (error) {
        return null;
    }

}