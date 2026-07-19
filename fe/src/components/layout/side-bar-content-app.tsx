'use client'
import { NavMain } from "@/src/components/layout/nav-bar"
import {
    SidebarContent,

} from "@/src/components/ui/sidebar"
import { IconPlayerPlay } from "@tabler/icons-react"

const data = {
    navMain: [
        {
            title: "Video",
            url: "/videos",
            icon: IconPlayerPlay,
        },
    ],
}


export function SidebarContentApp() {

    return (
        <SidebarContent>
            <NavMain items={data.navMain} />
        </SidebarContent>


    )
}