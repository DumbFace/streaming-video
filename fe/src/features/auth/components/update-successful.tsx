import { Button } from '@/src/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation';

export const UpdateSuccessfulComponent = () => {
    const router = useRouter();
    return (
        <div className="animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="pt-10 pb-4 text-center space-y-5">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-950 border border-green-800 ring-8 ring-green-900/40">
                    <CheckCircle2 className="h-12 w-12 text-green-400 stroke-[1.5]" />
                </div>
                <div className="space-y-2.5">
                    <CardTitle className="text-2xl font-bold text-neutral-50">
                        Password Updated Successfully!
                    </CardTitle>
                    <CardDescription className="text-sm px-6 text-neutral-400">
                        Your account password has been updated. You can now use your new password to sign in.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="pt-2 pb-8">
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 shadow-md"
                    onClick={() => router.push("/sign-in")}
                >
                    Go to Login
                </Button>
            </CardContent>
        </div>
    )
}
