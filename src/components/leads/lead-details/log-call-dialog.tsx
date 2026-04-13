"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import {
  CALL_OUTCOME_LABELS,
  type CallOutcome,
} from "@/services/activity/schema";
import { isAxiosError } from "axios";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const OUTCOMES = Object.keys(CALL_OUTCOME_LABELS) as CallOutcome[];

export function LogCallDialog({
  leadId,
  onSuccess,
}: {
  leadId: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome | "">("");
  const [notes, setNotes] = useState("");
  const logCall = useLogCallAttempt(leadId, {
    onSuccess: () => {
      setOpen(false);
      setOutcome("");
      setNotes("");
      onSuccess?.();
    },
  });

  const errorMessage = (() => {
    const err = logCall.error;
    if (!err) return null;
    if (isAxiosError(err)) {
      const d = err.response?.data;
      if (d && typeof d === "object" && "error" in d) {
        const e = (d as { error: unknown }).error;
        if (typeof e === "string") return e;
      }
    }
    return getApiErrorMessage(err, "Could not log call");
  })();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!outcome) return;
    try {
      await logCall.mutateAsync({
        outcome,
        notes: notes.trim() || undefined,
      });
    } catch {
      /* surfaced via errorMessage */
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Log a call</p>
          <p className="text-xs text-muted-foreground">
            Record the outcome after you contact this lead.
          </p>
        </div>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="default"
            size="lg"
            className={cn(
              "h-auto min-h-11 w-full justify-start gap-3 border-2 border-sky-500/90 bg-sky-600 px-4 py-3 text-left text-white shadow-md shadow-sky-950/15",
              "hover:bg-sky-700 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-950/20",
              "focus-visible:border-sky-300 focus-visible:ring-sky-400/40",
            )}
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"
              aria-hidden
            >
              <Phone className="size-5 text-white" strokeWidth={2.25} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold leading-tight">Log call</span>
              <span className="text-xs font-normal text-sky-100/90">
                Outcome and optional notes
              </span>
            </span>
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log call attempt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="call-outcome">Outcome</Label>
              <Select
                value={outcome || undefined}
                onValueChange={(v) => setOutcome(v as CallOutcome)}
                disabled={logCall.isPending}
                required
              >
                <SelectTrigger id="call-outcome" className="w-full">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CALL_OUTCOME_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="call-notes">Notes (optional)</Label>
              <Textarea
                id="call-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional details…"
                rows={3}
                disabled={logCall.isPending}
              />
            </div>
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={logCall.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={logCall.isPending || !outcome}>
              {logCall.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
