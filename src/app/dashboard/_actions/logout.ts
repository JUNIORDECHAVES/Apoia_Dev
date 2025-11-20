'use server';
import { signOut } from "@/lib/auth.config";

export async function logOut() {
    await signOut()
}