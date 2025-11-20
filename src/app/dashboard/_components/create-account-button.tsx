'use client';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function CreateAccountButton() {
    const [loading, setLoading] = useState(false);

    async function handleCreateAccount() {
        setLoading(true);
        try {
            const res = await fetch(`/api/stripe/create-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await res.json();

            if (!res.ok) {
                toast.error('Erro ao criar conta de pagamentos.');
                setLoading(false);
                return;
            }

            window.location.href = data.url;

        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    return (
        <div className="mb-5">
            <Button className="cursor-pointer"
                onClick={handleCreateAccount}
                disabled={loading}
            >
                {loading ? 'Carregando...' : 'Ativar conta de pagamentos'}

            </Button>
        </div>
    );
}