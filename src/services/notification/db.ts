import { NotificationReadState, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/utils/pagination";
import {
  CreateNotificationRequest,
  ListNotificationsParams,
  ListNotificationsResponseData,
  NotificationListItem,
} from "./schema";

const notificationListSelect = {
  id: true,
  title: true,
  body: true,
  leadId: true,
  readState: true,
  readAt: true,
  createdAt: true,
  lead: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.NotificationSelect;

export const dbGetLeadAssignedTo = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: { id: leadId },
    select: { assignedToId: true },
  });
};

export const dbCreateNotification = async (
  request: CreateNotificationRequest,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.notification.create({
    data: {
      title: request.title,
      body: request.body,
      recipientId: request.recipientId,
      leadId: request.leadId ?? null,
    },
  });
};

export const dbListNotificationsForRecipient = async (
  recipientId: string,
  params: ListNotificationsParams,
): Promise<ListNotificationsResponseData> => {
  const where: Prisma.NotificationWhereInput = { recipientId };
  const whereUnread: Prisma.NotificationWhereInput = {
    recipientId,
    readState: NotificationReadState.UNREAD,
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationListSelect,
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: whereUnread }),
  ]);

  return {
    notifications: notifications as NotificationListItem[],
    pagination: buildPagination(total, params.page, params.pageSize),
    unreadCount,
  };
};

export const dbMarkNotificationReadForRecipient = async (
  id: string,
  recipientId: string,
): Promise<NotificationListItem | null> => {
  const existing = await prisma.notification.findFirst({
    where: { id, recipientId },
    select: { id: true },
  });

  if (!existing) return null;

  const updated = await prisma.notification.update({
    where: { id },
    data: { readState: NotificationReadState.READ, readAt: new Date() },
    select: notificationListSelect,
  });

  return updated as NotificationListItem;
};
