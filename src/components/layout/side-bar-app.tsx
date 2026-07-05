import { SidebarContentApp } from "@/src/components/layout/side-bar-content-app"
import { SidebarFooterApp } from "@/src/components/layout/side-bar-footer-app"
import { SidebarHeaderApp } from "@/src/components/layout/side-bar-header-app"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/src/components/ui/sidebar"

export function SideBarApp() {
    return (
        <Sidebar>
            <SidebarHeaderApp />
            <SidebarContentApp />
            <SidebarFooterApp />
        </Sidebar>
    )
}