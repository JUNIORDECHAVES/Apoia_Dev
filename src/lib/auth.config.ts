import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma";
import Github from "next-auth/providers/github";
export const {handlers, signIn, signOut, auth} = NextAuth({
    secret: process.env.AUTH_SECRET!,
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        Github({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!
        })
    ],

})
