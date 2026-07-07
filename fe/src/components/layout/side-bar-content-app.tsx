import { SidebarFooterApp } from "@/src/components/layout/side-bar-footer-app"
import { SidebarHeaderApp } from "@/src/components/layout/side-bar-header-app"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/src/components/ui/sidebar"
import { Plus } from "lucide-react"

export function SidebarContentApp() {
    return (
        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <a href="/videos">
                            <span>Video</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>

    )
}