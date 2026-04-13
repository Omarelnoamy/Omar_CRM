"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateReminderDialog } from "@/components/reminders/CreateReminderDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/leads/reusable";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  useGetMyReminders,
  useUpdateReminder,
} from "@/lib/tanstack/useReminders";

type ReminderTab = "ALL" | "UPCOMING" | "OVERDUE" | "COMPLETED" | "CANCELLED";

function reminderVisual(reminder: {
  status: "PENDING" | "FIRED" | "CANCELLED" | "COMPLETED";
  dueAt: string | Date;
}) {
  if (reminder.status === "CANCELLED") {
    return {
      label: "Cancelled",
      className: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }
  if (reminder.status === "COMPLETED") {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (reminder.status === "FIRED") {
    return {
      label: "Fired",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  const overdue =
    reminder.status === "PENDING" && new Date(reminder.dueAt) < new Date();
  if (overdue) {
    return {
      label: "Overdue",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  return {
    label: "Upcoming",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  };
}

function ReminderActionButtons({ reminderId }: { reminderId: string }) {
  const updateReminder = useUpdateReminder(reminderId);
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={updateReminder.isPending}
        onClick={() => updateReminder.mutate({ status: "COMPLETED" })}
      >
        Complete
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={updateReminder.isPending}
        onClick={() => updateReminder.mutate({ status: "CANCELLED" })}
      >
        Cancel
      </Button>
    </div>
  );
}

export function RemindersPageClient() {
  const [tab, setTab] = useState<ReminderTab>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const statusParam =
    tab === "COMPLETED"
      ? "COMPLETED"
      : tab === "CANCELLED"
        ? "CANCELLED"
        : tab === "UPCOMING" || tab === "OVERDUE"
          ? "PENDING"
          : undefined;

  const { data, isLoading, isError, error } = useGetMyReminders({
    page,
    pageSize,
    status: statusParam,
    ...(tab === "OVERDUE" ? { overdueOnly: true } : {}),
    ...(tab === "COMPLETED" ? { includeFired: true } : {}),
  });

  const { data: overdueData } = useGetMyReminders({
    page: 1,
    pageSize: 1,
    overdueOnly: true,
  });

  const reminders = useMemo(() => {
    const items = data?.reminders ?? [];
    if (tab === "OVERDUE") return items;
    if (tab === "UPCOMING") {
      return items.filter(
        (item) =>
          item.status === "PENDING" && new Date(item.dueAt) >= new Date(),
      );
    }
    return items;
  }, [data?.reminders, tab]);

  const overdueCount = overdueData?.pagination.total ?? 0;

  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            My Reminders
          </h1>
          <CreateReminderDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Create Reminder
              </Button>
            }
          />
        </div>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as ReminderTab);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
            <TabsTrigger value="OVERDUE" className="gap-2">
              Overdue
              {overdueCount > 0 ? (
                <Badge
                  variant="destructive"
                  className="h-5 rounded-full px-1.5"
                >
                  {overdueCount}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading reminders...</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Failed to load reminders")}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    No reminders found.
                  </TableCell>
                </TableRow>
              ) : (
                reminders.map((reminder) => {
                  const visual = reminderVisual(reminder);
                  return (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        {format(new Date(reminder.dueAt), "PPP p")}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {reminder.title}
                      </TableCell>
                      <TableCell>
                        {reminder.lead ? (
                          <Link
                            href={`/leads/${reminder.lead.id}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {reminder.lead.name}
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={visual.className}>
                          {visual.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reminder.status === "PENDING" ? (
                          <ReminderActionButtons reminderId={reminder.id} />
                        ) : (
                          <span className="text-slate-400">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Pagination
            startItem={startItem}
            endItem={endItem}
            total={total}
            page={page}
            pageCount={pageCount}
            isLoading={isLoading}
            setPage={setPage}
            itemLabel="reminders"
          />
        </>
      ) : null}
    </section>
  );
}
