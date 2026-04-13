import { z } from "zod";
import { ReminderStatus } from "@/generated/prisma/enums";

const queryBooleanSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return value;
}, z.boolean().optional());

export const createReminderSchema = z.object({
  leadId: z.uuid(),
  title: z.string().min(1),
  note: z.string().optional(),
  dueAt: z.coerce.date().refine((date) => {
    return (
      date.getTime() > new Date().getTime() &&
      date.getTime() < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime()
    );
  }),
  assignedToId: z.uuid().optional(),
});

export type CreateReminderRequest = z.infer<typeof createReminderSchema>;

/** Body for `POST /api/leads/:id/reminders` — `leadId` comes from the URL. */
export const createReminderWithoutLeadSchema = createReminderSchema.omit({
  leadId: true,
});

export type CreateReminderWithoutLeadInput = z.infer<
  typeof createReminderWithoutLeadSchema
>;

export const reminderIdParamsSchema = z.object({
  id: z.uuid(),
});

export const qstashReminderDueSchema = z.object({
  reminderId: z.uuid(),
});

export const listLeadRemindersSchema = z.object({
  leadId: z.uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
});

export type ListLeadRemindersRequest = z.infer<typeof listLeadRemindersSchema>;

export const listMyRemindersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
  assignedToId: z.uuid().optional(),
  overdueOnly: queryBooleanSchema,
  includeFired: queryBooleanSchema,
});

export type ListMyRemindersRequest = z.infer<typeof listMyRemindersSchema>;

export const updateReminderSchema = z.object({
  status: z.enum(["CANCELLED", "COMPLETED"]),
});

export type UpdateReminderRequest = z.infer<typeof updateReminderSchema>;
