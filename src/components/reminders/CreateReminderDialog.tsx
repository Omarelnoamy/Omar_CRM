"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import { useCreateReminder } from "@/lib/tanstack/useReminders";
import { cn } from "@/lib/utils";

type CreateReminderDialogProps = {
  leadId?: string;
  trigger?: ReactNode;
};

export function CreateReminderDialog({ leadId, trigger }: CreateReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [time, setTime] = useState("09:00");
  const [selectedLeadId, setSelectedLeadId] = useState(leadId ?? "");

  const createReminder = useCreateReminder();
  const { data: leadsData, isLoading: isLeadsLoading } = useGetLeads({
    page: 1,
    pageSize: 100,
  });

  const resolvedLeadId = leadId ?? selectedLeadId;
  const canSubmit = useMemo(
    () =>
      title.trim().length > 0 &&
      Boolean(selectedDate) &&
      time.length > 0 &&
      Boolean(resolvedLeadId),
    [resolvedLeadId, selectedDate, time, title],
  );

  const buildDueAt = () => {
    if (!selectedDate) return null;
    const [hours, minutes] = time.split(":").map((v) => Number(v));
    const dueAt = new Date(selectedDate);
    dueAt.setHours(hours || 0, minutes || 0, 0, 0);
    return dueAt;
  };

  const handleCreate = async () => {
    const dueAt = buildDueAt();
    if (!dueAt || !resolvedLeadId) return;

    await createReminder.mutateAsync({
      title: title.trim(),
      dueAt,
      leadId: resolvedLeadId,
    });

    setOpen(false);
    setTitle("");
    setSelectedDate(undefined);
    setTime("09:00");
    if (!leadId) {
      setSelectedLeadId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Create Reminder</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {!leadId ? (
            <div className="grid gap-2">
              <Label htmlFor="reminder-lead">Lead</Label>
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger id="reminder-lead">
                  <SelectValue
                    placeholder={isLeadsLoading ? "Loading leads..." : "Select a lead"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(leadsData?.leads ?? []).map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="reminder-title">Title</Label>
            <Input
              id="reminder-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up with this lead"
            />
          </div>

          <div className="grid gap-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    date > new Date(new Date().setDate(new Date().getDate() + 7))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reminder-time">Due Time</Label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reminder-time"
                type="time"
                className="pl-9"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {createReminder.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(createReminder.error, "Failed to create reminder")}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit || createReminder.isPending}>
            {createReminder.isPending ? "Creating..." : "Create Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
