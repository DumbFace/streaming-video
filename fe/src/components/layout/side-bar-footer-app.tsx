'use client'
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/src/components/ui/sidebar";
import { UserNavFooter } from "@/src/components/layout/user-navigator-app";
import { useSession } from "next-auth/react";

export function SidebarFooterApp() {
    const { status } = useSession();

    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <UserNavFooter />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    )

}
