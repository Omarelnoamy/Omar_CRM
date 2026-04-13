import { prisma } from "@/lib/prisma";
import { CreateReminderRequest } from "./schema";
import { Prisma, ReminderStatus } from "@/generated/prisma/client";

export const dbGetLeadAssignedTo = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      assignedToId: true,
    },
  });
};

export const dbCreateReminder = async (
  reminder: CreateReminderRequest & { assignedToId: string },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.create({
    data: {
      title: reminder.title,
      note: reminder.note,
      dueAt: reminder.dueAt,
      leadId: reminder.leadId,
      assignedToId: reminder.assignedToId,
    },
  });
};

export const dbUpdateReminderQstashMessageId = async (
  reminderId: string,
  qstashMessageId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id: reminderId },
    data: { qstashMessageId },
  });
};

export const dbGetReminder = async (
  reminderId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.findUnique({
    where: { id: reminderId },
    select: {
      assignedToId: true,
      leadId: true,
      title: true,
      note: true,
      lead: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });
};

export const dbUpdateReminderStatus = async (
  reminderId: string,
  status: ReminderStatus,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id: reminderId },
    data: { status },
  });
};

export const dbGetLeadReminders = async (
  where: Prisma.ReminderWhereInput,
  params: { page: number; pageSize: number },
) => {
  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      orderBy: { dueAt: "desc" },
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      include: {
        lead: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.reminder.count({ where }),
  ]);
  return { reminders, total };
};

export const dbCompleteReminder = async (
  reminderId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id: reminderId },
    data: { status: "COMPLETED" },
  });
};

export const dbGetReminderById = async (reminderId: string) => {
  return prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      lead: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
};
