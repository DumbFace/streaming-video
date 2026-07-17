'use client'
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
import { useCreateUserMutation } from "@/src/features/auth/hooks/useCreateUserMutation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import z from "zod"
import { toast } from 'sonner';
import { Spinner } from "@/src/components/ui/spinner"
import { ErrorCodes } from "@/src/features/auth/constants/errorCode"
import Link from "next/link"


const signUpFormSchema = z
    .object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().min(1, "Email is required").email(),
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine(values => values.password === values.confirmPassword,
        {
            message: "Password and Comfirm password is not match.",
            path: ["confirmPassword"]
        })

export type SignInFormValues = z.infer<typeof signUpFormSchema>

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const defaultValue: SignInFormValues = {
        fullName: "Kang Farm Fun",
        email: "gv.runfast@gmail.com",
        password: "Abc123@@@",
        confirmPassword: "Abc123@@@"
    }

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: defaultValue
    })
    const { errors } = form.formState;
    const createUserMuation = useCreateUserMutation();
    useEffect(() => {
        form.reset(defaultValue)
    }, [])



    const handleSubmit = async (formData: SignInFormValues) => {
        console.log("formData: ", formData);
        const response = await createUserMuation.mutateAsync(formData)
        if (response.success) {
            toast(response.message)
        } else {
            switch (response.exception?.code) {
                case ErrorCodes.DuplicateUnique:
                    // form.setError({ "email", { type: "validate", message: "Email is existed, Please use another" } })
                    form.setError("email", {
                        type: "validate",
                        message: "Email is existed, Please use another"
                    });
                    break;
                default:
                    break;
            }
        }
    }


    return (
        <FormProvider {...form}>
            <Card {...props}>
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                        Enter your information below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                <Input {...form.register("fullName")} />
                                {errors.fullName && (
                                    <span className="text-sm text-red-500">{errors.fullName.message}</span>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input {...form.register("email")} />
                                <FieldDescription>
                                    We&apos;ll use this to contact you. We will not share your email
                                    with anyone else.
                                </FieldDescription>
                                {errors.email && (
                                    <span className="text-sm text-red-500">{errors.email.message}</span>
                                )}
                            </Field>
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
                            <FieldGroup>
                                <Field>
                                    <Button type="submit">
                                        {createUserMuation.isPending ? <Spinner></Spinner> : "Create Account"}
                                    </Button>
                                    <Button variant="outline" type="button" disabled={createUserMuation.isPending}>
                                        Sign up with Google
                                    </Button>
                                    <FieldDescription className="px-6 text-center">
                                        Already have an account? <Link href="/sign-in">Sign in</Link>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </FormProvider>

    )
}
