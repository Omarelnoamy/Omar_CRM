import { UserSnapshot } from "@/utils/types/user";
import {
  CreateReminderRequest,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
} from "./schema";
import {
  dbCreateReminder,
  dbGetLeadAssignedTo,
  dbGetReminder,
  dbUpdateReminderQstashMessageId,
  dbUpdateReminderStatus,
  dbGetLeadReminders,
  dbGetReminderById,
  dbCompleteReminder,
} from "./db";
import { qstash, reminderCallbackUrl } from "@/lib/qstash";
import { prisma } from "@/lib/prisma";
import { validateLeadAccess } from "./helper";
import { redis } from "@/lib/redis";
import { NotificationService } from "@/services/notification";
import { buildPagination } from "@/utils/pagination";
import { Prisma, ReminderStatus, Role } from "@/generated/prisma/client";

export class ReminderServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ReminderServiceError";
  }
}

export const createReminder = async (
  request: CreateReminderRequest,
  userSnapshot: UserSnapshot,
) => {
  // assignedTo is either from body or the requesting user
  const assignedToId = request.assignedToId ?? userSnapshot.id;

  // Validate assignedTo has access to the lead
  const leadAssignedTo = await dbGetLeadAssignedTo(request.leadId);
  if (!validateLeadAccess(leadAssignedTo?.assignedToId, userSnapshot)) {
    throw new ReminderServiceError(
      "You are not authorized to create a reminder for this lead",
      403,
    );
  }

  // In a transaction
  const reminder = await prisma.$transaction(async (tx) => {
    // Create reminder
    const reminder = await dbCreateReminder({ ...request, assignedToId }, tx);
    const notBefore = reminder.dueAt.getTime();

    // Schedule reminder
    const publishResult = await qstash.publishJSON({
      url: reminderCallbackUrl,
      body: { reminderId: reminder.id },
      notBefore: notBefore / 1000,
    });

    // Update db reminder with qstash message id
    await dbUpdateReminderQstashMessageId(
      reminder.id,
      publishResult.messageId,
      tx,
    );

    return { ...reminder, qstashMessageId: publishResult.messageId };
  });

  return reminder;
};

export const fireReminder = async (reminderId: string) => {
  const idempotencyKey = `reminder:fired:${reminderId}`;
  const IDEMPOTENCY_TTL_SEC = 60 * 60 * 24;
  const alreadyProcessed = await redis.get(idempotencyKey);

  if (alreadyProcessed)
    return {
      status: "duplicate" as const,
    };

  const reminder = await dbGetReminder(reminderId);
  if (!reminder) {
    await redis.set(idempotencyKey, "missing", "EX", IDEMPOTENCY_TTL_SEC);
    return {
      status: "missing" as const,
    };
  }

  // Set idempotency key (single atomic command with TTL).
  const claimed = await redis.set(
    idempotencyKey,
    "processed",
    "EX",
    IDEMPOTENCY_TTL_SEC,
    "NX",
  );
  if (claimed !== "OK") {
    return {
      status: "duplicate" as const,
    };
  }

  await prisma.$transaction(async (tx) => {
    // Update reminder status to DUE
    await dbUpdateReminderStatus(reminderId, ReminderStatus.FIRED, tx);

    // Create notification
    const noteSuffix = reminder.note ? ` Note: ${reminder.note}` : "";
    await NotificationService.create(
      {
        title: reminder.title,
        body: `Reminder for lead ${reminder.lead.name}.${noteSuffix}`,
        recipientId: reminder.assignedToId,
        leadId: reminder.leadId,
      },
      { id: reminder.assignedTo.id, role: reminder.assignedTo.role },
      tx,
    );
  });

  return {
    status: "success" as const,
  };
};

export const listLeadReminders = async (
  request: ListLeadRemindersRequest,
  userSnapshot: UserSnapshot,
) => {
  const where: Prisma.ReminderWhereInput = {
    leadId: request.leadId,
  };

  if (userSnapshot.role === Role.AGENT) {
    where.assignedToId = userSnapshot.id;
  }

  if (request.status) {
    where.status = request.status;
  }

  const result = await dbGetLeadReminders(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    reminders: result.reminders,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
};

export const listMyReminders = async (
  request: ListMyRemindersRequest,
  userSnapshot: UserSnapshot,
) => {
  const where: Prisma.ReminderWhereInput = {};
  const andClauses: Prisma.ReminderWhereInput[] = [];

  if (userSnapshot.role === Role.AGENT) {
    where.assignedToId = userSnapshot.id;
  } else if (request.assignedToId) {
    where.assignedToId = request.assignedToId;
  }

  if (request.overdueOnly) {
    andClauses.push({ status: ReminderStatus.PENDING });
    andClauses.push({ dueAt: { lt: new Date() } });
  } else if (request.status) {
    if (request.status === ReminderStatus.COMPLETED && request.includeFired) {
      andClauses.push({
        OR: [
          { status: ReminderStatus.COMPLETED },
          { status: ReminderStatus.FIRED },
        ],
      });
    } else {
      andClauses.push({ status: request.status });
    }
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  const result = await dbGetLeadReminders(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    reminders: result.reminders,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
};

export const completeReminder = async (
  reminderId: string,
  userSnapshot: UserSnapshot,
) => {
  const reminder = await dbGetReminderById(reminderId);
  if (!reminder) {
    throw new ReminderServiceError("Reminder not found", 404);
  }

  if (
    reminder.status !== ReminderStatus.PENDING &&
    reminder.status !== ReminderStatus.FIRED
  ) {
    throw new ReminderServiceError(
      "Only pending or fired reminders can be completed",
      400,
    );
  }

  if (!validateLeadAccess(reminder.assignedToId, userSnapshot)) {
    throw new ReminderServiceError(
      "You are not authorized to complete this reminder",
      403,
    );
  }

  // If PENDING, cancel the QStash message to prevent the webhook from firing
  if (reminder.status === "PENDING" && reminder.qstashMessageId) {
    try {
      await qstash.messages.delete(reminder.qstashMessageId);
    } catch {
      // QStash message may have already been delivered or expired
    }
  }

  return dbCompleteReminder(reminderId);
};

export const cancelReminder = async (
  reminderId: string,
  userSnapshot: UserSnapshot,
) => {
  const reminder = await dbGetReminderById(reminderId);
  if (!reminder) {
    throw new ReminderServiceError("Reminder not found", 404);
  }

  if (reminder.status !== ReminderStatus.PENDING) {
    throw new ReminderServiceError(
      "Only pending reminders can be cancelled",
      400,
    );
  }

  if (!validateLeadAccess(reminder.assignedToId, userSnapshot)) {
    throw new ReminderServiceError(
      "You are not authorized to cancel this reminder",
      403,
    );
  }

  // Cancel the QStash message if it exists
  if (reminder.qstashMessageId) {
    try {
      await qstash.messages.delete(reminder.qstashMessageId);
    } catch {
      // QStash message may have already been delivered or expired
    }
  }

  return dbUpdateReminderStatus(reminderId, ReminderStatus.CANCELLED);
};
