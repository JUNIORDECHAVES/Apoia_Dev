'use client'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createPayment } from "../_actions/create-Payment";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório." }).min(3, "O nome deve ter no mínimo 3 caracteres."),
    message: z.string().min(1, "A mensagem é obrigatória."),
    price: z.enum(["15", "25", "35", "50", "100"], { required_error: "O valor da doação é obrigatório." }),
})

type FormData = z.infer<typeof formSchema>

interface FormDonateProps {
    slug: string;
    creatorId: string;
    name: string;
}

export function FormDonate({ slug, creatorId, name }: FormDonateProps) {

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            message: '',
            price: '15',
        },
    })

    async function onSubmit(data: FormData) {

        const priceIncents = Number(data.price) * 100;

        const checkout = await createPayment({
            name: data.name,
            message: data.message,
            price: priceIncents,
            creatorId: creatorId,
            slug: slug
        });

        await handlePaymentRedirect(checkout);

    }

    type ErrorCase = {
        error: string;
        sessionId?: undefined;
        url?: undefined;
    };

    type SuccessCase = {
        sessionId: string;
        url: string | null;
        error?: undefined;
    };

    type SessionResult = ErrorCase | SuccessCase;

    async function handlePaymentRedirect(checkout: SessionResult) {
        if (checkout.error) {
            toast.error(checkout.error);
            return;
        }

        if (!checkout.sessionId) {
            toast.error('Falha ao criar pagamento, tente novamente.');
        }

        const url = checkout.url;
        if (url) {
            window.location.href = url;
        }

    }

    return (
        <Card className="shadow-xl border-0 border-white/95 backdrop-blur-sm h-fit">
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                    Apoiar {name}
                </CardTitle>
                <CardDescription>
                    Sua contribuição ajuda a manter o conteúdo
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form} >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite seu nome" {...field}
                                            className="bg-white"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensagem</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Digite sua mensagem" {...field}
                                            className="bg-white h-32 resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor da doação</FormLabel>
                                    <FormControl>

                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex items-center gap-3 ">
                                            {["15", "25", "35", "50", "100"].map((value) => {
                                                return (
                                                    <div key={`Value ${value}`} className="flex items-center space-x-2 mt-2 gap-2">
                                                        <RadioGroupItem value={value} id={`Value ${value}`} />
                                                        <Label className="text-md" htmlFor={`Value ${value}`}>R$ {value}</Label>
                                                    </div>
                                                )
                                            })}
                                        </RadioGroup>

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >{form.formState.isSubmitting ? 'Aguarde...' : 'Fazer doação'}</Button>
                    </form>

                </Form>
            </CardContent>
        </Card>
    )
}