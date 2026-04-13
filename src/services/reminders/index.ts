import {
  createReminderSchema,
  createReminderWithoutLeadSchema,
  listLeadRemindersSchema,
  listMyRemindersSchema,
  qstashReminderDueSchema,
  updateReminderSchema,
} from "./schema";
import {
  createReminder,
  fireReminder,
  listLeadReminders,
  listMyReminders,
  cancelReminder,
  completeReminder,
  ReminderServiceError,
} from "./service";

export { ReminderServiceError };

export const ReminderService = {
  create: createReminder,
  fire: fireReminder,
  listByLead: listLeadReminders,
  listMy: listMyReminders,
  cancel: cancelReminder,
  complete: completeReminder,
} as const;

export const ReminderSchema = {
  create: createReminderSchema,
  createForLead: createReminderWithoutLeadSchema,
  qstash: qstashReminderDueSchema,
  listByLead: listLeadRemindersSchema,
  listMy: listMyRemindersSchema,
  update: updateReminderSchema,
} as const;
