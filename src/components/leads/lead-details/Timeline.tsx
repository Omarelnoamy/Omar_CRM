"use client";

import { ActivityType } from "@/generated/prisma/enums";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useGetLeadActivities } from "@/lib/tanstack/useActivities";
import {
  Bell,
  Paperclip,
  Brain,
  CheckCircle,
  Phone,
  Pencil,
  PlusCircle,
  ArrowRight,
  LucideIcon,
  User,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pagination } from "../reusable";

export const Timeline = ({ leadId }: { leadId: string }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, error } = useGetLeadActivities({
    leadId,
    page,
    pageSize,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>Error: {getApiErrorMessage(error, "Failed to load activities")}</div>
    );
  }

  const activities = data?.activities ?? [];
  if (activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No activities found
      </div>
    );
  }

  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="space-y-0">
      {activities.map((activity, idx) => {
        const Icon = activityIcons[activity.type];
        const label = activityLabels[activity.type];
        const isLast = idx === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium">{label}</span>
                {activity.actor && (
                  <span className="text-xs text-muted-foreground">
                    by {activity.actor.name}
                  </span>
                )}
                <span
                  className="ml-auto text-xs text-muted-foreground"
                  title={new Date(activity.createdAt).toLocaleString()}
                >
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {activity.content && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.content}
                </p>
              )}
            </div>
          </div>
        );
      })}

      <Pagination
        startItem={startItem}
        endItem={endItem}
        total={total}
        page={page}
        pageCount={pageCount}
        isLoading={isLoading}
        setPage={setPage}
      />
    </div>
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
