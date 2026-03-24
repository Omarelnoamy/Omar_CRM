import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //check if user is authenticated
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!profile || !profile.isActive) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar role={profile.role} user={profile} />
      <AppShell role={profile.role} email={profile.email}>
        {children}
      </AppShell>
    </SidebarProvider>
  );
}
