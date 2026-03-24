import type React from "react";

import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";

const statusVariantMap: Record<
  LeadStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  OPEN: "secondary",
  WON: "default",
  LOST: "outline",
};

const stageVariantMap: Record<
  LeadStage,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  NEW: "outline",
  CONTACTED: "secondary",
  QUALIFIED: "default",
  NEGOTIATION: "secondary",
};

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLeadDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={statusVariantMap[status]}>{formatEnumLabel(status)}</Badge>
  );
}

export function StageBadge({ stage }: { stage: LeadStage }) {
  return (
    <Badge variant={stageVariantMap[stage]}>{formatEnumLabel(stage)}</Badge>
  );
}

export function Pagination({
  startItem,
  endItem,
  total,
  page,
  pageCount,
  isLoading,
  setPage,
}: {
  startItem: number;
  endItem: number;
  total: number;
  page: number;
  pageCount: number;
  isLoading: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Showing {startItem}-{endItem} of {total} leads
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="rounded-xl bg-white"
          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          disabled={isLoading || page <= 1}
        >
          Previous
        </Button>
        <div className="text-sm text-slate-500">
          Page {page} of {Math.max(pageCount, 1)}
        </div>
        <Button
          className="rounded-xl shadow-sm"
          onClick={() =>
            setPage((currentPage) =>
              Math.min(Math.max(pageCount, 1), currentPage + 1),
            )
          }
          disabled={isLoading || page >= Math.max(pageCount, 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
