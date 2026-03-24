import { Prisma, Profile, Role } from "@/generated/prisma/client";
import { ListedLeadsParams } from "@/services/leads/schema";
import { dbListLeads } from "./db";

export async function ListLeads(profile: Profile, params: ListedLeadsParams) {
  // Build the where clause
  const where: Prisma.LeadWhereInput = {};
  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}
