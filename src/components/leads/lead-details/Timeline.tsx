"use client";

import { ActivityType } from "@/generated/prisma/enums";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useGetLeadActivities } from "@/lib/tanstack/useActivities";
import { Pagination } from "../reusable";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bell,
  Brain,
  CheckCircle,
  LucideIcon,
  Paperclip,
  Pencil,
  Phone,
  PlusCircle,
  User,
} from "lucide-react";
import { useState } from "react";
import { LogCallDialog } from "./log-call-dialog";
import { TimelineNoteForm } from "./timeline-note-form";

export const Timeline = ({ leadId }: { leadId: string }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const goToFirstPage = () => setPage(1);

  const { data, isLoading, isError, error } = useGetLeadActivities({
    leadId,
    page,
    pageSize,
  });

  const activities = data?.activities ?? [];
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);
  const hasActivities = activities.length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <TimelineNoteForm leadId={leadId} onSuccess={goToFirstPage} />
        </div>
        <div className="w-full shrink-0 lg:max-w-[min(100%,20rem)]">
          <LogCallDialog leadId={leadId} onSuccess={goToFirstPage} />
        </div>
      </div>

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading activities...</div>
        ) : null}

        {isError ? (
          <div className="text-sm text-destructive">
            {getApiErrorMessage(error, "Failed to load activities")}
          </div>
        ) : null}

        {!isLoading && !isError ? (
          hasActivities ? (
            <div className="space-y-0">
              {activities.map((activity, idx) => {
                const Icon = activityIcons[activity.type];
                const label = activityLabels[activity.type];
                const isLast = idx === activities.length - 1;

                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <Icon className="h-4 w-4 text-slate-500" />
                      </div>
                      {!isLast ? (
                        <div className="w-px flex-1 bg-slate-200" />
                      ) : null}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-base font-semibold text-slate-900">
                          {label}
                        </span>
                        {activity.actor ? (
                          <span className="text-sm text-slate-500">
                            by {activity.actor.name}
                          </span>
                        ) : null}
                        <span
                          className="ml-auto text-xs text-slate-500"
                          title={new Date(activity.createdAt).toLocaleString()}
                        >
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {activity.content ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {activity.content}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No activities found</div>
          )
        ) : null}
      </div>

      {!isLoading && !isError && hasActivities ? (
        <Pagination
          startItem={startItem}
          endItem={endItem}
          total={total}
          page={page}
          pageCount={pageCount}
          isLoading={isLoading}
          setPage={setPage}
          itemLabel="activities"
        />
      ) : null}
    </section>
  );
};

const activityIcons: Record<ActivityType, LucideIcon> = {
  [ActivityType.LEAD_CREATED]: PlusCircle,
  [ActivityType.NOTE]: Pencil,
  [ActivityType.CALL_ATTEMPT]: Phone,
  [ActivityType.STATUS_CHANGE]: CheckCircle,
  [ActivityType.STAGE_CHANGE]: ArrowRight,
  [ActivityType.ASSIGNMENT_CHANGE]: User,
  [ActivityType.REMINDER_CREATED]: Bell,
  [ActivityType.ATTACHMENT_ADDED]: Paperclip,
  [ActivityType.AI_LEAD_BRIEF_GENERATED]: Brain,
  [ActivityType.AI_FOLLOWUP_DRAFT_GENERATED]: Brain,
};

const activityLabels: Record<ActivityType, string> = {
  [ActivityType.LEAD_CREATED]: "Lead Created",
  [ActivityType.NOTE]: "Note",
  [ActivityType.CALL_ATTEMPT]: "Call Attempt",
  [ActivityType.STATUS_CHANGE]: "Status Change",
  [ActivityType.STAGE_CHANGE]: "Stage Change",
  [ActivityType.ASSIGNMENT_CHANGE]: "Assignment Change",
  [ActivityType.REMINDER_CREATED]: "Reminder Created",
  [ActivityType.ATTACHMENT_ADDED]: "Attachment Added",
  [ActivityType.AI_LEAD_BRIEF_GENERATED]: "AI Lead Brief Generated",
  [ActivityType.AI_FOLLOWUP_DRAFT_GENERATED]: "AI Followup Draft Generated",
};
