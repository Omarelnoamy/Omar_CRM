"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateReminderDialog } from "@/components/reminders/CreateReminderDialog";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  useGetLeadReminders,
  useUpdateReminder,
} from "@/lib/tanstack/useReminders";

type ReminderItem = {
  id: string;
  title: string;
  note: string | null;
  dueAt: string | Date;
  status: "PENDING" | "FIRED" | "CANCELLED" | "COMPLETED";
};

function toDate(date: string | Date) {
  return date instanceof Date ? date : new Date(date);
}

function getReminderState(reminder: ReminderItem) {
  if (reminder.status === "CANCELLED") return "cancelled" as const;
  if (reminder.status === "COMPLETED") return "completed" as const;
  if (reminder.status === "FIRED") return "fired" as const;
  const isOverdue =
    reminder.status === "PENDING" && toDate(reminder.dueAt) < new Date();
  if (isOverdue) return "overdue" as const;
  return "upcoming" as const;
}

function ReminderStateBadge({ reminder }: { reminder: ReminderItem }) {
  const state = getReminderState(reminder);
  const map = {
    upcoming: {
      label: "Upcoming",
      className: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
    },
    overdue: {
      label: "Overdue",
      className: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50",
    },
    fired: {
      label: "Fired",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
    },
    completed: {
      label: "Completed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
    },
  } as const;

  return (
    <Badge variant="outline" className={map[state].className}>
      {map[state].label}
    </Badge>
  );
}

export function Reminders({ leadId }: { leadId: string }) {
  const [page] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading, isError, error } = useGetLeadReminders(leadId, {
    page,
    pageSize,
  });

  const reminders = (data?.reminders ?? []) as ReminderItem[];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <CreateReminderDialog
          leadId={leadId}
          trigger={
            <Button>
              <Plus className="size-4" />
              Create Reminder
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading reminders...</p>
          ) : null}
          {isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(error, "Failed to load reminders")}
            </p>
          ) : null}
          {!isLoading && !isError && reminders.length === 0 ? (
            <p className="text-sm text-slate-500">No reminders yet.</p>
          ) : null}

          {!isLoading && !isError && reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function ReminderRow({ reminder }: { reminder: ReminderItem }) {
  const updateReminder = useUpdateReminder(reminder.id);
  const dueAt = toDate(reminder.dueAt);
  const isActionable =
    reminder.status === "PENDING" || reminder.status === "FIRED";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-medium text-slate-900">{reminder.title}</p>
        <p className="text-sm text-slate-500">Due {format(dueAt, "PPP p")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ReminderStateBadge reminder={reminder} />
        {isActionable ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateReminder.mutate({ status: "COMPLETED" })}
              disabled={updateReminder.isPending}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateReminder.mutate({ status: "CANCELLED" })}
              disabled={updateReminder.isPending}
            >
              Cancel
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
