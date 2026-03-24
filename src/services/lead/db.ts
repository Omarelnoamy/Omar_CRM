import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ListedLeadsParams } from "./schema";

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListedLeadsParams,
) {
  //Get leads
  const leads = await prisma.lead.findMany({
    take: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  return leads;
}
