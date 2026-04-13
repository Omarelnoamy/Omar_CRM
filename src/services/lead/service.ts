import { ActivityType, Prisma, Profile, Role } from "@/generated/prisma/client";
import {
  CreateLeadRequest,
  EditLeadRequest,
  LeadDetail,
  ListLeadsParams,
} from "./schema";
import {
  dbCreateLead,
  dbFindAssignableProfileById,
  dbGetLeadById,
  dbListLeads,
  dbUpdateLead,
} from "./db";
import { buildLeadChangeActivities } from "./helper";
import { canEditLeadAssignment, canEditLeadContactFields } from "./permissions";
import { ActivityService } from "../activity";
import { prisma } from "@/lib/prisma";

export class LeadServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "LeadServiceError";
  }
}

function dayStartUtc(isoDay: string): Date {
  return new Date(`${isoDay}T00:00:00.000Z`);
}

function dayEndUtc(isoDay: string): Date {
  return new Date(`${isoDay}T23:59:59.999Z`);
}

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  const where: Prisma.LeadWhereInput = {};

  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.stage) {
    where.stage = params.stage;
  }

  if (params.search) {
    const q = params.search;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.createdFrom || params.createdTo) {
    where.createdAt = {};
    if (params.createdFrom) {
      where.createdAt.gte = dayStartUtc(params.createdFrom);
    }
    if (params.createdTo) {
      where.createdAt.lte = dayEndUtc(params.createdTo);
    }
  }

  return dbListLeads(where, params);
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  const result = await prisma.$transaction(async (tx) => {
    const lead = await dbCreateLead(profile, data, tx);
    await ActivityService.create(
      [
        {
          leadId: lead.id,
          actorId: profile.id,
          type: ActivityType.LEAD_CREATED,
        },
      ],
      tx,
    );

    return lead;
  });

  return result;
}

export async function getLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);

  if (!lead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (profile.role === Role.AGENT && lead.assignedToId !== profile.id) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  return lead;
}

export async function updateLead(
  profile: Profile,
  id: string,
  data: EditLeadRequest,
) {
  const existingLead = await dbGetLeadById(id);

  if (!existingLead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (profile.role === Role.AGENT && existingLead.assignedToId !== profile.id) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  if (profile.role === Role.AGENT && data.assignedToId !== undefined) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  if (!canEditLeadContactFields(profile.role, data)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  if (!canEditLeadAssignment(profile.role, data)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  const newLeadForActivities: Partial<LeadDetail> = { ...data };
  if (data.assignedToId !== undefined) {
    const prev = existingLead.assignedToId ?? null;
    const next = data.assignedToId ?? null;
    if (prev !== next) {
      if (data.assignedToId === null) {
        newLeadForActivities.assignedTo = null;
      } else {
        const assignee = await dbFindAssignableProfileById(data.assignedToId);
        newLeadForActivities.assignedTo = assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              email: assignee.email,
            }
          : null;
      }
    }
  }

  const activities = buildLeadChangeActivities({
    leadId: id,
    actorId: profile.id,
    existingLead,
    newLead: newLeadForActivities,
  });

  const result = await prisma.$transaction(async (tx) => {
    const updatedLead = await dbUpdateLead(id, data, tx);
    const activitiesCreated = await ActivityService.create(activities, tx);
    if (!activitiesCreated.success)
      throw new Error("Failed to create activities");

    return {
      lead: updatedLead,
      activities: activitiesCreated.count,
    };
  });

  return result;
}
