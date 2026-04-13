import { LeadStatus, type Profile, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDashboardLeadStats(profile: Profile) {
  const scope =
    profile.role === Role.AGENT ? { assignedToId: profile.id } : undefined;

  const [total, inProgress, completed] = await Promise.all([
    prisma.lead.count({ where: scope }),
    prisma.lead.count({
      where: { ...scope, status: LeadStatus.OPEN },
    }),
    prisma.lead.count({
      where: { ...scope, status: LeadStatus.WON },
    }),
  ]);

  return { total, inProgress, completed };
}
