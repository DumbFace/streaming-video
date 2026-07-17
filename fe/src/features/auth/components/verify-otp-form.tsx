'use client'
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Loader2, AlertCircle, } from "lucide-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/src/components/ui/input-otp";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import Link from "next/link";
import { getTll, getValue, rmKey, setEx } from "@/src/features/auth/actions/caching.action";
import { RedisPrefix } from "@/src/features/auth/constants/redis-prefix";
import { generateResetToken } from "@/src/lib/utils.server";
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation"
import { SendOTPForgotpasswordAction } from "@/src/features/auth/actions/send-otp-forgot-password.action";
import { toast } from "sonner";

const verifyOtpFormSchema = z
    .object({
        otp: z.string()
            .min(5, "Invaliad OTP")
            .regex(/^[0-9]+$/, "OTP only accepts number")
    })

export type verifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>

export default function VerifyOTPForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '/';

    const router = useRouter();
    const [timeleft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        getTll({
            prefix: RedisPrefix.FORGOT_PASSWORD,
            key: email
        })
            .then((timeToLive) => {
                if (timeToLive.success)
                    setTimeLeft(timeToLive.data);
            })
            .catch((err) => {
                console.error(err);
                setTimeLeft(0);
            });

    }, []);

    useEffect(() => {
        if (timeleft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [timeleft])

    const [isLoading, setIsLoading] = useState(false);
    const defaultValue: verifyOtpFormValues = {
        otp: "",
    }
    const form = useForm<verifyOtpFormValues>({
        resolver: zodResolver(verifyOtpFormSchema),
        defaultValues: defaultValue
    })

    const handleSubmit = async (formData: verifyOtpFormValues) => {
        const response = await getValue({ prefix: RedisPrefix.FORGOT_PASSWORD, key: email })

        if (!response.success) {
            console.warn(response.exception?.message);
            return false;
        }

        const otpData = JSON.parse(response.data ?? "{}");

        if (otpData.otp !== formData.otp) {
            form.setError("otp", { message: "OTP is incorrect", type: "validate" })
            return false;
        }

        const token = await generateResetToken();

        var setResponse = await setEx({
            prefix: RedisPrefix.RESET_PASSWORD,
            key: email,
            ttl: 300,
            data: { token: token }
        })

        if (!setResponse.success) {
            console.warn(setResponse.exception?.message);
            return false;
        }

        await rmKey({ key: email, prefix: RedisPrefix.FORGOT_PASSWORD });

        router.push(`/reset-password?token=${token}&email=${email}`);
    };
    const { errors } = form.formState;
    const otpValue = form.watch("otp");

    const onAbort = () => {
        console.log("Test");
    }
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Verify OTP
                    </CardTitle>
                    <CardDescription>
                        We have sent a 6-digit verification code to
                        <br />
                        <span className="font-medium text-foreground">{email}</span>
                    </CardDescription>
                </CardHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(async (data) => {
                        setIsLoading(true);
                        setIsLoading(await handleSubmit(data) ?? false);
                    })} onAbort={onAbort} className="flex flex-col gap-y-3">
                        <CardContent className="space-y-6 flex flex-col items-center">
                            <InputOTP
                                {...form.register("otp")}
                                maxLength={6}
                                value={otpValue || ""}
                                onChange={async (e: string) => {
                                    form.setValue("otp", e);
                                    await form.trigger("otp");
                                }}
                                disabled={isLoading}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>

                                <InputOTPSeparator />

                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>

                            {errors.otp && (
                                <Alert variant="destructive" className="w-full text-left">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.otp.message}</AlertDescription>
                                </Alert>
                            )}

                            {timeleft > 0 && (
                                <span>
                                    OTP expires in {" "}
                                    <span className="font-mono font-medium text-primary">
                                        {String(Math.floor(timeleft / 60)).padStart(2, "0")}
                                        :
                                        {String(timeleft % 60).padStart(2, "0")}
                                    </span>
                                </span>
                            )}

                        </CardContent>
                        {/* 
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full" type="submit" disabled={timeleft < 1 || isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Verifying..." : "Confirm"}
                            </Button>

                            <div className="text-sm text-center text-muted-foreground">
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    className="text-primary hover:underline transition-colors disabled:opacity-50 font-medium"
                                    onClick={async () => {
                                        var response = await SendOTPForgotpasswordAction({ formData: { email } })
                                        if (!response.success) console.warn(response.message);
                                        toast("Resend OTP successful");
                                        setTimeLeft(120);
                                    }}
                                >
                                    Resend
                                </button>
                            </div>

                            <div className="text-sm text-center text-muted-foreground mt-2">
                                <Link href="/sign-in">&larr; Back to login</Link>
                            </div>
                        </CardFooter> */}

                    </form>
                </FormProvider>
            </Card>
        </div>
    );
}
