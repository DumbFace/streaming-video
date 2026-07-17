'use client';
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"

export function UserNavFooter() {
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ redirectTo: '/sign-in' });
    }

    if (!(session && session.user && session.user.name && session.user.email)) return;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    role="button"
                    className="flex w-full items-center gap-3 rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus:bg-accent"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image ?? "https://github.com/shadcn.png"} alt={session.user.name} />
                        <AvatarFallback className="rounded-md">
                            {session.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{session.user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {session.user.email}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56"
                align="end"
                side="right"
                sideOffset={8}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user.image ?? "https://github.com/shadcn.png"} alt={session.user.name} />
                            <AvatarFallback>
                                {session.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground leading-none">
                                {session.user.email}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Upgrade to Pro</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}