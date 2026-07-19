import { SignupForm } from '@/src/features/auth/components/sign-up-form';
import { Suspense } from 'react';

export default function LoginPage() {
    console.log("test")
    return (
        <main className="flex items-center justify-center md:h-screen">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <Suspense>
                    <SignupForm />
                </Suspense>
            </div>
        </main>
    );
}