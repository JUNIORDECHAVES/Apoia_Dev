'use server';

import { auth } from "@/lib/auth.config";
import z from "zod";
import {prisma} from '@/lib/prisma';

const changeNameSchema = z.object({
    name: z.string().min(4,"o username deve ter no mínimo 4 caracteres")
})

type ChangeNameSchema = z.infer<typeof changeNameSchema>;

export async function changeName(data: ChangeNameSchema) {
    const session = await auth();

    const userId = session?.user?.id;

    if(!userId) {
        return {
            data: null,
            error: 'Usuário não autenticado'
        }
    } 

    const schema = changeNameSchema.safeParse(data);

    if(!schema.success) {
        return {
            data: null,
            error: schema.error.issues[0].message
        }
    }

    try {
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: data.name }
        })

        return {
            data: updatedUser.name,
        }

    } catch (error) {
        console.log(error);
        return {
            data: null,
            error: 'Erro ao atualizar o nome'
        }
    }


}