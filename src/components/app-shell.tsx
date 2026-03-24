"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  formatRoleLabel,
  getProtectedPageMeta,
} from "@/components/app-shell-config";

export function AppShell({
  role,
  email,
  children,
}: {
  role: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pageMeta = getProtectedPageMeta(pathname);

  return (
    <SidebarInset className="min-h-svh bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="size-9 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-950" />
          <Separator
            orientation="vertical"
            className="hidden h-6 bg-slate-200 sm:block"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Welcome, {formatRoleLabel(role)}!
            </p>
            <p className="hidden truncate text-xs text-slate-500 md:block">
              {pageMeta.title} · {pageMeta.description}
            </p>
          </div>
        </div>

        <p className="hidden text-sm text-slate-500 md:block">{email}</p>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </SidebarInset>
  );
}
