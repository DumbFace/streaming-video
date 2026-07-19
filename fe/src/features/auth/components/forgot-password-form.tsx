'use client';
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import Link from "next/link";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldLabel } from "@/src/components/ui/field";
import { useRouter } from 'next/navigation';
import { SendOTPForgotpasswordAction } from "@/src/features/auth/actions/send-otp-forgot-password.action";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const forgotPasswordSchmema = z.object({
    email: z.string().min(1, { message: "Email Address is required" }).email()
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchmema>

export default function ForgotPasswordForm() {
    const router = useRouter();
    const defaultValues: ForgotPasswordFormValues = {
        email: "gv.runfast@gmail.com"
    }
    const sendMailMutation = useMutation({
        mutationFn: async (formData: ForgotPasswordFormValues) => {
            const response = await SendOTPForgotpasswordAction({ formData: formData })

            return response;
        }
    })

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchmema),
        defaultValues: defaultValues
    });

    const handleSubmit = async (formData: ForgotPasswordFormValues) => {

        const response = await sendMailMutation.mutateAsync(formData);

        if (!response.success) { console.warn(response.exception?.message); return; }

        router.push(`/verify-otp?email=${formData.email}`)
    };
    const { errors } = form.formState;

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Forgot Password?
                    </CardTitle>
                    <CardDescription>
                        No worries! Enter your email and we will send you a password reset link.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-y-3">
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input {...form.register("email")} />
                            {errors.email && (
                                <span className="text-sm text-red-500">{errors.email.message}</span>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={sendMailMutation.isPending}>
                            {sendMailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Request
                        </Button>

                        <div className="text-sm text-center text-muted-foreground">
                            <Link href="/sign-in">&larr; Back to login</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>

    );
}