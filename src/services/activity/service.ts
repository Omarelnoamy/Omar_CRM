import { ActivityType, Prisma, Role } from "@/generated/prisma/client";
import {
  dbCreateActivities,
  dbCreateActivity,
  dbCreateAIActivity,
  dbGetLeadActivities,
} from "./db";
import { buildActivityContent } from "./helper";
import {
  ActivitySummaryItem,
  CreateActivityRequest,
  CreateAIActivityRequest,
  createAIActivitySchema,
  createManyActivitiesSchema,
  GetLeadActivitiesRequest,
} from "./schema";
import { buildPagination } from "@/utils/pagination";
import { UserSnapshot } from "@/utils/types/user";

export async function createActivityItem(input: {
  leadId: string;
  actorId: string;
  type: ActivityType;
  contentOverride: string;
}): Promise<
  | { success: true; activity: ActivitySummaryItem }
  | { success: false; errors: Record<string, string[] | undefined> }
> {
  if (
    input.type !== ActivityType.NOTE &&
    input.type !== ActivityType.CALL_ATTEMPT
  ) {
    return {
      success: false,
      errors: { type: ["Only NOTE and CALL_ATTEMPT are supported"] },
    };
  }

  const trimmed = input.contentOverride.trim();
  if (!trimmed) {
    return {
      success: false,
      errors: { content: ["Content is required"] },
    };
  }

  const content = buildActivityContent(input.type, undefined, trimmed);
  if (!content) {
    return {
      success: false,
      errors: { content: ["Content is required"] },
    };
  }

  const activity = await dbCreateActivity({
    leadId: input.leadId,
    actorId: input.actorId,
    type: input.type,
    content,
  });

  return { success: true, activity };
}

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
    const content = buildActivityContent(
      activity.type,
      activity.meta,
      activity.content,
    );
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

export async function createAIActivity(request: CreateAIActivityRequest) {
  const validated = createAIActivitySchema.safeParse(request);
  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const activity = await dbCreateAIActivity(validated.data);

  return {
    success: true as const,
    activity,
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
