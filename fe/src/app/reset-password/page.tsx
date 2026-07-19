"use client";
import { Card } from "@/src/components/ui/card";
import ResetPasswordForm from "@/src/features/auth/components/reset-password-form";
import { UpdateSuccessfulComponent } from "@/src/features/auth/components/update-successful";
import { FnSucceedResponse } from '../../lib/fn-response';
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    const { data } = useQuery<FnSucceedResponse<void>>({
        queryKey: ["resetPasswordResult"],
        queryFn: () => {
            return {} as FnSucceedResponse<void>;
        },
        staleTime: Infinity,
        enabled: false
    });
    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <Suspense>
                <Card className="w-full max-w-md">
                    {data?.success ?
                        <UpdateSuccessfulComponent /> : <ResetPasswordForm />
                    }

                </Card>
            </Suspense>
        </div>
    );
}