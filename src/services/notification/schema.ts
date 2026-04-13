import { NotificationReadState } from "@/generated/prisma/client";
import { PaginationMeta } from "@/utils/pagination";
import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  recipientId: z.uuid(),
  leadId: z.uuid().optional(),
});

export type CreateNotificationRequest = z.infer<typeof createNotificationSchema>;

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListNotificationsParams = z.infer<typeof listNotificationsQuerySchema>;

export const notificationIdParamsSchema = z.object({
  id: z.uuid(),
});

export interface NotificationLeadSummary {
  id: string;
  name: string;
}

export interface NotificationListItem {
  id: string;
  title: string;
  body: string;
  leadId: string | null;
  readState: NotificationReadState;
  readAt: Date | null;
  createdAt: Date;
  lead: NotificationLeadSummary | null;
}

export interface ListNotificationsResponseData {
  notifications: NotificationListItem[];
  pagination: PaginationMeta;
  unreadCount: number;
}
