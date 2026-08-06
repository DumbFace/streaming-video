'use client';
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import Link from "next/link";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldLabel } from "@/src/components/ui/field";
import { useRouter, useSearchParams } from 'next/navigation';
import { getValue, rmKey, setEx } from "@/src/features/auth/actions/caching.action";
import { RedisPrefix } from "@/src/features/auth/constants/redis-prefix";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useResetPasswordMutation } from "@/src/features/auth/mutations/useResetPasswordMutation";


const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string().min(1, "Confirm password is required")
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: "Password and Confirm password do not match.",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;


export default function ResetPasswordForm() {
    const resetPasswordMutation = useResetPasswordMutation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isHasToken, checkIsHasToken] = useState<boolean>(true);
    const [isSuccess] = useState(false);

    const token = searchParams.get("token") ?? "";
    const email = searchParams.get("email") ?? "";

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!token) {
            checkIsHasToken(false);
        }
    }, [token]);

    const handleSubmit = async (formData: ResetPasswordFormValues) => {
        if (!token) return;

        const response = await getValue({ key: email, prefix: RedisPrefix.RESET_PASSWORD });
        if (!response.success) {
            console.warn(response.exception?.message)
            return;
        }

        console.log("response: ", response);
        const objectAsString = JSON.parse(response.data ?? "{}")
        if (objectAsString && objectAsString.token !== token) {
            console.warn("Invalid Token");
            return;
        }

        const resetPasswordResponse = await resetPasswordMutation.mutateAsync({ email: email, password: formData.password });

        if (!resetPasswordResponse.success) console.warn(resetPasswordResponse.message);

        await rmKey({ key: email, prefix: RedisPrefix.RESET_PASSWORD })
    };
    const { errors } = form.formState;

    return (
        <>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription>
                    Enter your new password below to update your account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {!isHasToken && (
                    <Alert variant="destructive" className="mb-4 text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Invalid authentication link or missing reset token</AlertDescription>
                    </Alert>
                )}

                {isSuccess && (
                    <Alert className="mb-4 border-green-500 text-green-600 text-left">
                        <CheckCircle2 className="h-4 w-4 !text-green-600" />
                        <AlertDescription>
                            Password updated successfully! Redirecting to login page...
                        </AlertDescription>
                    </Alert>
                )}

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input {...form.register("password")} type="password" />
                            <FieldDescription>
                                Must be at least 8 characters long.
                            </FieldDescription>
                            {errors.password && (
                                <span className="text-sm text-red-500">{errors.password.message}</span>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirm-password">
                                Confirm Password
                            </FieldLabel>

                            <Input {...form.register("confirmPassword")} type="password" />
                            <FieldDescription>Please confirm your password.</FieldDescription>
                            {errors.confirmPassword && (
                                <span className="text-sm text-red-500">{errors.confirmPassword.message}</span>
                            )}
                        </Field>

                        <Button
                            className="w-full mt-2"
                            type="submit"
                            disabled={!isHasToken || resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                </FormProvider>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="hover:underline transition-colors">
                    &larr; Back to login
                </Link>
            </CardFooter>
        </>
    );
}