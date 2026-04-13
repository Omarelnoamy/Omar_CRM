"use client";

import type { ReactNode } from "react";

import { NotificationBell } from "@/components/notification-icon";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export function AppShell({
  userName,
  email,
  children,
}: {
  userName: string;
  email: string;
  children: ReactNode;
}) {
  return (
    <SidebarInset className="min-h-svh bg-[linear-gradient(180deg,#fafbfc_0%,#f4f6f8_100%)]">
      <header className="sticky top-0 z-20 grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 shadow-sm backdrop-blur md:gap-6 md:px-8">
        <SidebarTrigger className="size-9 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-950" />
        <p className="min-w-0 truncate text-center text-base font-semibold text-slate-900">
          Welcome, {userName}!
        </p>
        <div className="flex items-center justify-end gap-2">
          <p className="hidden max-w-[220px] truncate text-sm text-slate-500 md:block">
            {email}
          </p>
          <NotificationBell />
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </SidebarInset>
  );
}
