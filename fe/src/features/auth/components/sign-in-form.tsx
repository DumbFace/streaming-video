'use client'
import { useRouter } from 'next/navigation';
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import z from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useLoginMutation } from "@/src/features/auth/hooks/useLoginMutation"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { signIn } from 'next-auth/react';
import Link from 'next/link';


const loginFormSchema = z
    .object({
        email: z.string().min(1, "Email is required").email(),
        password: z
            .string()
            .min(1, "Password is required")
    })
export type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const loginMuation = useLoginMutation();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const router = useRouter();

    const defaultValue: LoginFormValues = {
        //TODO Remove default value later
        email: "gv.runfast@gmail.com",
        password: "abc123123",
    }

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: defaultValue
    })

    const { errors } = form.formState;

    useEffect(() => {
        form.reset(defaultValue)
    }, [])

    const handleSubmit = async (formData: LoginFormValues) => {
        var response = await loginMuation.mutateAsync(formData);

        if (!response.success) {
            console.log("exception: ", response.exception?.message);
            toast(response.message);
            return;
        }

        toast(response.message);
        router.push(callbackUrl);
    }

    const handleSignInUsingGoogle = async () => {
        signIn("google", { callbackUrl: callbackUrl });
    }

    return (
        <FormProvider {...form}>
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input {...form.register("email")} />
                                    {errors.email && (
                                        <span className="text-sm text-red-500">{errors.email.message}</span>
                                    )}
                                </Field>
                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Link href="/forgot-password" className='ml-auto inline-block text-sm underline-offset-4 hover:underline'>Forgot your password? </Link>

                                    </div>
                                    <Input {...form.register("password")} type="password" />
                                    {errors.password && (
                                        <span className="text-sm text-red-500">{errors.password.message}</span>
                                    )}
                                </Field>
                                <Field>
                                    <Button type="submit">Login</Button>
                                    <Button variant="outline" type="button" onClick={handleSignInUsingGoogle}>
                                        Login with Google
                                    </Button>
                                    <FieldDescription className="text-center">
                                        Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </FormProvider>
    )
}
