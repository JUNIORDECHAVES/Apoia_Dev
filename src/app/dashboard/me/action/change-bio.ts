'use server';

import { auth } from "@/lib/auth.config";
import z from "zod";
import {prisma} from '@/lib/prisma';

const changeBioSchema = z.object({
    bio: z.string().min(4,"a biografia deve ter no mínimo 4 caracteres")
})

type ChangeBioSchema = z.infer<typeof changeBioSchema>;

export async function changeBio(data: ChangeBioSchema) {
    const session = await auth();
    const userId = session?.user?.id;

    if(!userId) {
        return {
            data: null,
            error: 'Usuário não autenticado'
        }
    } 

    const schema = changeBioSchema.safeParse(data);

    if(!schema.success) {
        return {
            data: null,
            error: schema.error.issues[0].message
        }
    }

    try {
        
        const updatedBio = await prisma.user.update({
            where: { id: userId },
            data: { bio: data.bio }
        })

        return {
            data: updatedBio.bio,
        }

    } catch (error) {
        console.log(error);
        return {
            data: null,
            error: 'Erro ao atualizar a Biografia'
        }
    }


}