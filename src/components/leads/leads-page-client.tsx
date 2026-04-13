"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Inbox, Search } from "lucide-react";

import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { Role } from "@/generated/prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import {
  formatEnumLabel,
  formatLeadDate,
  Pagination,
  StageBadge,
  StatusBadge,
} from "@/components/leads/reusable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAxiosError } from "axios";
import type { ListLeadsParams } from "@/services/lead/schema";

const ALL_VALUE = "__all__";

const leadStatuses = [
  LeadStatus.OPEN,
  LeadStatus.WON,
  LeadStatus.LOST,
] as const;

const leadStages = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.NEGOTIATION,
] as const;

export function LeadsPageClient({ role }: { role: Role }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const isManagerOrAdmin = role === "MANAGER" || role === "ADMIN";
  const canCreateLead = role !== "AGENT";

  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const listParams = useMemo((): ListLeadsParams => {
    const base: ListLeadsParams = {
      page,
      pageSize,
    };
    if (debouncedSearch) {
      base.search = debouncedSearch;
    }
    if (statusFilter) {
      base.status = statusFilter as ListLeadsParams["status"];
    }
    if (stageFilter) {
      base.stage = stageFilter as ListLeadsParams["stage"];
    }
    if (createdFrom) {
      base.createdFrom = createdFrom;
    }
    if (createdTo) {
      base.createdTo = createdTo;
    }
    return base;
  }, [
    page,
    pageSize,
    debouncedSearch,
    statusFilter,
    stageFilter,
    createdFrom,
    createdTo,
  ]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetLeads(listParams);

  const errorDetail = (() => {
    if (!isAxiosError(error)) return null;
    const payload = error.response?.data;
    if (payload && typeof payload === "object" && "error" in payload) {
      const e = (payload as { error: unknown }).error;
      if (typeof e === "string") return e;
    }
    if (error.response?.status === 401)
      return "Your session may have expired. Sign in again and retry.";
    return error.message;
  })();

  const leads = data?.leads ?? [];
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);
  const hasLeads = leads.length > 0;

  function clearFilters() {
    setStatusFilter("");
    setStageFilter("");
    setSearchInput("");
    setDebouncedSearch("");
    setCreatedFrom("");
    setCreatedTo("");
  }

  const hasActiveFilters =
    Boolean(statusFilter) ||
    Boolean(stageFilter) ||
    Boolean(debouncedSearch) ||
    Boolean(createdFrom) ||
    Boolean(createdTo);

  return (
    <div className="space-y-6 px-4 pb-8 pt-2 md:px-6 md:pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            {role === "AGENT" ? "My Leads" : "Leads"}
          </h1>
          <p className="text-sm text-slate-500">
            Review the pipeline and open a record for full details.
          </p>
        </div>

        {canCreateLead ? (
          <CreateLeadDialog
            triggerClassName="h-10 rounded-xl bg-sky-600 px-4 text-white shadow-sm hover:bg-sky-700"
          />
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:flex-row md:flex-wrap md:items-end md:gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-500">Status</Label>
            <Select
              value={statusFilter || ALL_VALUE}
              onValueChange={(v) =>
                setStatusFilter(v === ALL_VALUE ? "" : v)
              }
            >
              <SelectTrigger className="h-10 w-full min-w-[160px] rounded-lg border-slate-200 bg-white md:w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                {leadStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatEnumLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-500">Stage</Label>
            <Select
              value={stageFilter || ALL_VALUE}
              onValueChange={(v) => setStageFilter(v === ALL_VALUE ? "" : v)}
            >
              <SelectTrigger className="h-10 w-full min-w-[160px] rounded-lg border-slate-200 bg-white md:w-[180px]">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All stages</SelectItem>
                {leadStages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatEnumLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid min-w-0 flex-1 gap-1.5 md:min-w-[220px]">
            <Label className="text-xs text-slate-500">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search leads…"
                className="h-10 rounded-lg border-slate-200 bg-white pl-9"
                aria-label="Search leads"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-500">Created from</Label>
            <Input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="h-10 w-full rounded-lg border-slate-200 bg-white md:w-[160px]"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-500">Created to</Label>
            <Input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="h-10 w-full rounded-lg border-slate-200 bg-white md:w-[160px]"
            />
          </div>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 shrink-0 border-slate-200 bg-white"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            {isFetching ? "Refreshing leads…" : "Loading leads…"}
          </div>
        ) : null}

        {isError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <p className="text-sm font-medium text-destructive">
              Couldn&apos;t load leads
            </p>
            <p className="max-w-md text-sm text-slate-500">
              {errorDetail
                ? errorDetail
                : "Check your connection, database, and that you are signed in. If this continues, try again in a moment."}
            </p>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          hasLeads ? (
            <>
              <Table>
                <TableHeader className="[&_tr]:border-slate-200">
                  <TableRow>
                    <TableHead className="bg-slate-50/80 px-6 text-[11px] tracking-[0.18em] text-slate-500">
                      Name
                    </TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                      Email
                    </TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                      Phone
                    </TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                      Stage
                    </TableHead>
                    <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                      Created
                    </TableHead>
                    {isManagerOrAdmin ? (
                      <TableHead className="bg-slate-50/80 px-5 text-[11px] tracking-[0.18em] text-slate-500">
                        Assigned Agent
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="border-slate-200 hover:bg-slate-50/80"
                    >
                      <TableCell className="px-6 py-4 font-medium text-slate-900">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {lead.name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">
                        {lead.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">
                        {lead.phone}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <StageBadge stage={lead.stage} />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">
                        {formatLeadDate(lead.createdAt)}
                      </TableCell>
                      {isManagerOrAdmin ? (
                        <TableCell className="px-5 py-4">
                          {lead.assignedTo ? (
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">
                                {lead.assignedTo.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {lead.assignedTo.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500">Unassigned</span>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
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
              />
            </>
          ) : (
            <div className="px-6 py-6">
              <div className="flex min-h-72 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                  <Inbox className="size-6 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-slate-900">
                    {hasActiveFilters ? "No matching leads" : "No leads yet"}
                  </p>
                  <p className="max-w-md text-sm text-slate-500">
                    {hasActiveFilters
                      ? "Try adjusting filters or clear them to see more results."
                      : canCreateLead
                        ? "Create your first lead to start building the pipeline for this CRM."
                        : "Leads assigned to you will appear here once a manager or admin adds them."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {hasActiveFilters ? (
                    <Button type="button" variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : null}
                  {canCreateLead ? <CreateLeadDialog /> : null}
                </div>
              </div>
            </div>
          )
        ) : null}
      </section>
    </div>
  );
}
