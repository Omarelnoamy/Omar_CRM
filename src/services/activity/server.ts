import { Prisma, Role } from "@/generated/prisma/client";
import { dbCreateActivities, dbGetLeadActivities } from "./db";
import { buildActivityContent } from "./helper";
import {
  CreateActivityRequest,
  createManyActivitiesSchema,
  GetLeadActivitiesRequest,
} from "./schema";
import { buildPagination } from "@/utils/pagination";
import { UserSnapshot } from "@/utils/types/user";

export async function createActivities(
  request: CreateActivityRequest[],
  tx?: Prisma.TransactionClient,
) {
  const validated = createManyActivitiesSchema.safeParse(request);
  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const activitiesToCreate: Prisma.ActivityCreateManyInput[] = [];
  for (const activity of validated.data) {
    const content = buildActivityContent(activity.type, activity.meta);
    activitiesToCreate.push({
      leadId: activity.leadId,
      actorId: activity.actorId,
      content,
      type: activity.type,
    });
  }

  const countCreated = await dbCreateActivities(activitiesToCreate, tx);

  return {
    success: true as const,
    count: countCreated.count,
  };
}

export async function getLeadActivities(
  request: GetLeadActivitiesRequest,
  userSnapshot: UserSnapshot,
) {
  const where: Prisma.ActivityWhereInput = {
    leadId: request.leadId,
  };

  if (userSnapshot.role === Role.AGENT) {
    where.lead = {
      assignedToId: userSnapshot.id,
    };
  }

  const result = await dbGetLeadActivities(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    activities: result.activities,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
}
