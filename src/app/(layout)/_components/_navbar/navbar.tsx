"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "RSN",
    email: "rinta.nugroho@incoe.astra.co.id",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "RSN",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Production Flow",
          url: "/admin/dashboard/production-flow",
        },
      ],
    },{
      title: "Components",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "All Transaction",
          url: "/admin/wh-component/transaction",
        },
        {
          title: "Matching Boxes",
          url: "/admin/wh-component",
        },
      ],
    },
    {
      title: "Production",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "All Transaction",
          url: "/admin/production/transaction",
        },
        {
          title: "Station 1",
          url: "/admin/production/transaction/station-1",
        },
        {
          title: "Station 2",
          url: "/admin/production/transaction/station-2",
        },
        {
          title: "Station 3",
          url: "/admin/production/transaction/station-3",
        },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Transactions",
          url: "#",
        },
        {
          title: "Reporting",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
