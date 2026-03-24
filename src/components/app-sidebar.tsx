"use client";

import { Profile, Role } from "@/generated/prisma/client";
import { Calendar, LayoutDashboard, User, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "./app-sidebar-footer";

const mainSidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Reminders", href: "/reminders", icon: Calendar },
];

const adminSidebarItems = [{ label: "Users", href: "/users", icon: User }];

export function AppSidebar({ role, user }: { role: Role; user: Profile }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h4 className="text-lg font-bold">CRM Pro</h4>
        <p>{role}</p>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        {/* Main sidebar items for all users */}
        <SidebarGroup>
          <SidebarGroupLabel>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainSidebarItems.map((item) => {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin sidebar items */}
        {role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel>ADMINISTRATION</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminSidebarItems.map((item) => {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
