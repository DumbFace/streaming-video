'use client';
import ForgotPasswordForm from "@/src/features/auth/components/forgot-password-form";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
    return (
        <Suspense>
            <ForgotPasswordForm />
        </Suspense>
    )
}
