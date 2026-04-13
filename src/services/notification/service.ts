import { Prisma, Profile } from "@/generated/prisma/client";
import { UserSnapshot } from "@/utils/types/user";
import {
  dbCreateNotification,
  dbGetLeadAssignedTo,
  dbListNotificationsForRecipient,
  dbMarkNotificationReadForRecipient,
} from "./db";
import { validateLeadAccess } from "./helpers";
import { CreateNotificationRequest, ListNotificationsParams } from "./schema";

export class NotificationServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

export type CreateNotificationInput = CreateNotificationRequest;

export const createNotification = async (
  request: CreateNotificationRequest,
  userSnapshot: UserSnapshot,
  tx?: Prisma.TransactionClient,
) => {
  if (request.leadId) {
    const lead = await dbGetLeadAssignedTo(request.leadId);
    if (!lead) {
      throw new NotificationServiceError("Lead not found", 404);
    }

    if (!validateLeadAccess(lead.assignedToId, userSnapshot)) {
      throw new NotificationServiceError(
        "You are not authorized to create a notification for this lead",
        403,
      );
    }
  }

  return dbCreateNotification(request, tx);
};

export async function listNotifications(
  profile: Profile,
  params: ListNotificationsParams,
) {
  return dbListNotificationsForRecipient(profile.id, params);
}

export async function markNotificationRead(profile: Profile, id: string) {
  const updated = await dbMarkNotificationReadForRecipient(id, profile.id);
  if (!updated) {
    throw new NotificationServiceError("Notification not found", 404);
  }
  return updated;
}

export const NotificationService = {
  create: createNotification,
  list: listNotifications,
  markRead: markNotificationRead,
} as const;
