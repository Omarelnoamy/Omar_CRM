"use client";

import { Profile, Role } from "@/generated/prisma/client";
import { Calendar, Contact, LayoutDashboard, Users } from "lucide-react";
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
  { label: "Leads", href: "/leads", icon: Contact },
  { label: "Reminders", href: "/reminders", icon: Calendar },
];

const adminSidebarItems = [{ label: "Users", href: "/users", icon: Users }];

export function AppSidebar({ role, user }: { role: Role; user: Profile }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/leads") {
      return pathname === "/leads" || pathname.startsWith("/leads/");
    }
    return pathname === href;
  };

  return (
    <Sidebar className="border-r border-slate-200/80 bg-[#F9FAFB]">
      <SidebarHeader className="gap-1 p-4">
        <h4 className="text-lg font-bold tracking-tight text-slate-900">
          CRM Pro
        </h4>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {role}
        </p>
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
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className="data-[active=true]:bg-sky-100 data-[active=true]:font-medium data-[active=true]:text-sky-950"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4 text-slate-500" />
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
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="data-[active=true]:bg-sky-100 data-[active=true]:font-medium data-[active=true]:text-sky-950"
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4 text-slate-500" />
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
