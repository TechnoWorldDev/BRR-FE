"use client"

import * as React from "react"
import Image from "next/image"
import {
  LayoutPanelLeft,
  Building2,
  Award,
  UsersRound,
  Sparkle,
  Star,
  Contact,
  Bug,
  Briefcase,
  FileText,
} from "lucide-react"

import { NavMain } from "@/components/admin/SidebarContent/NavMain"
import { NavUser } from "@/components/admin/SidebarContent/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"

const demoData = "Demo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [pendingBrandsCount, setPendingBrandsCount] = useState(0);

  
  // Default user data to fall back on if auth context user is not available
  const userData = {
    name: user?.fullName || "BBR Admin",
    email: user?.email || "admin@example.com",
    avatar: user?.avatar || "/avatars/shadcn.jpg",
  };

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutPanelLeft,
    },
    {
      title: "Residences",
      url: "/residences",
      icon: Building2,
      items: [
        {
          title: "Claim Requests",
          url: "/residences/claim-requests",
        },
        // {
        //   title: "Units Management",
        //   url: "/residences/units",
        // },
        {
          title: "Amenities",
          url: "/residences/amenities",
        },
        {
          title: "Lifestyles",
          url: "/residences/lifestyles",
        }
      ],
    },
    {
      title: "Rankings",
      url: "/rankings",
      icon: Award,
      items: [
        // {
        //   title: "Ranking Requests",
        //   url: "/rankings/ranking-requests",
        // }, 
        {
          title: "Ranking Categories",
          url: "/rankings/ranking-categories",
        },
        {
          title: "Ranking Category Types",
          url: "/rankings/ranking-category-types",
        },
        {
          title: "Ranking Criteria",
          url: "/rankings/ranking-criteria",
        }
      ]
    },
    {
      title: "Leads",
      url: "/leads",
      icon: Contact,
      items: [
        {
          title: "Requests",
          url: "/leads/requests",
        }
      ]
    },
  
    {
      title: "Reviews",
      url: "/reviews",
      icon: Star,
    },
    {
      title: "Brands",
      url: "/brands",
      icon: Sparkle,
      items: [
        // {
        //   title: "Pending Activations",
        //   url: "/brands?status=PENDING",
        //   badge: pendingBrandsCount,
        // },
        {
          title: "Brand Types",
          url: "/brands/types",
        }
      ]
    },
    {
      title: "User Management",
      url: "/user-management",
      icon: UsersRound,
    },
    {
      title: "Bugs and Features",
      url: "/bugs-and-features",
      icon: Bug,
    },
    {
      title: "Career",
      url: "/career",
      icon: Briefcase,
    },
    {
      title: "B2B Form Submissions",
      url: "/b2b-form-submissions",
      icon: FileText,
    },
  ];

  return (
    <Sidebar variant="inset" {...props} className="w-fit">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
              <a href="/dashboard">
                <Image src="/light-logo.svg" alt="Logo" width={85} height={36} />
              </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems as any} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}