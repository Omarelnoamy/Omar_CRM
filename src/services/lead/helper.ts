import { ActivityType, Lead } from "@/generated/prisma/client";
import { CreateActivityRequest } from "@/services/activity/schema";

interface BuildLeadChangeActivitiesParams {
  leadId: string;
  actorId: string;
  existingLead: Lead;
  newLead: Partial<Lead>;
}
export function buildLeadChangeActivities({
  leadId,
  actorId,
  existingLead,
  newLead,
}: BuildLeadChangeActivitiesParams) {
  const activities: CreateActivityRequest[] = [];

  if (newLead.status && newLead.status !== existingLead.status) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STATUS_CHANGE,
      meta: {
        from: existingLead.status,
        to: newLead.status,
      },
    });
  }

  if (newLead.stage && newLead.stage !== existingLead.stage) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STAGE_CHANGE,
      meta: {
        from: existingLead.stage,
        to: newLead.stage,
      },
    });
  }

  return activities;
}
