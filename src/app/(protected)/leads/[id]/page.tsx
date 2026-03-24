import { LeadDetailClient } from "@/components/leads/lead-detail-client";
import { authenticateUser } from "@/utils/authenticateUser";
import { notFound } from "next/navigation";

type LeadRouteParams = { id?: string; Id?: string };

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<LeadRouteParams>;
}) {
  const profile = await authenticateUser();
  const p = await params;
  const id = p.id ?? p.Id;
  if (!id) {
    notFound();
  }

  return <LeadDetailClient id={id} role={profile.role} />;
}
