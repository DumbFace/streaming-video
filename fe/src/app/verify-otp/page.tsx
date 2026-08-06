'use client'
import VerifyOTPForm from "@/src/features/auth/components/verify-otp-form";
import { Suspense } from "react";


export default function VerifyOtpPage() {

    return (
        <Suspense>
            <VerifyOTPForm />
        </Suspense>
    )
}
