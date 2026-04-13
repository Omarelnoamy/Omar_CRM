import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || !profile.isActive) {
    redirect("/auth/sign-out");
  }

  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar role={profile.role} user={profile} />
        <AppShell userName={profile.name} email={profile.email}>
          {children}
        </AppShell>
      </SidebarProvider>
    </QueryProvider>
  );
}
