"use server";

import { auth } from "@/lib/auth.config";
import { z} from "zod";
import { prisma } from "@/lib/prisma";
import createSlug from "@/utils/create-slug";

const createUsernameSchema = z.object({
    username: z.string({message: "o username é obrigatório"}).min(4, "o username deve ter no mínimo 4 caracteres").max(25, "o username deve ter no máximo 25 caracteres")
})

type createUsernameFormData = z.infer<typeof createUsernameSchema>

export async function createUsername(data: createUsernameFormData) {

    const session = await auth();
    if(!session?.user) {
        return {
            data: null,
            error: "Usuário não autenticado"
        }
    }

    const schema = createUsernameSchema.safeParse(data);
    if(!schema.success) {
        console.log(schema);
        return {
            data: null,
            error : schema.error.issues[0].message
        }
    }
    
    try {
        const userId = session.user.id;

        const slug = createSlug(data.username);
        console.log(slug)

        const existingUsername = await prisma.user.findFirst({
            where: {
                userName: slug
            }
        })
        if(existingUsername) {
            return {
                data: null,
                error : "Este username já está em uso"
            }
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                userName: slug
            }
        })

        return {
            data: slug,
            error: null
        }
    } catch (err) {
        return {
            data: null,
            error : "Falha ao atualizar o username"
        }
    }

}