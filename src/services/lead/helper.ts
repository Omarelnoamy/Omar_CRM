import { ActivityType } from "@/generated/prisma/client";
import { CreateActivityRequest } from "../activity";
import { LeadDetail } from "./schema";

interface BuildLeadChangeActivitiesParams {
  leadId: string;
  actorId: string;
  existingLead: LeadDetail;
  newLead: Partial<LeadDetail>;
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

  if (
    newLead.assignedToId !== undefined &&
    (newLead.assignedToId ?? null) !== (existingLead.assignedToId ?? null)
  ) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.ASSIGNMENT_CHANGE,
      meta: {
        from: existingLead.assignedTo?.name ?? "Unassigned",
        to:
          newLead.assignedToId === null
            ? "Unassigned"
            : (newLead.assignedTo?.name ?? "Unknown assignee"),
      },
    });
  }

  return activities;
}
