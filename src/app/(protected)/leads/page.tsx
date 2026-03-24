import { LeadsPageClient } from "@/components/leads/leads-page-client";
import { authenticateUser } from "@/utils/authenticateUser";

export default async function Leads() {
  const profile = await authenticateUser();
  return <LeadsPageClient role={profile.role} />;
}
