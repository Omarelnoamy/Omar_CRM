"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useGenerateCallFollowup } from "@/lib/tanstack/useAI";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import {
  CALL_OUTCOME_LABELS,
  type CallOutcome,
} from "@/services/activity/schema";
import { isAxiosError } from "axios";
import { Loader2, Phone, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CallFollowUp } from "@/services/ai/schema";

const OUTCOMES = Object.keys(CALL_OUTCOME_LABELS) as CallOutcome[];
type Step = "log" | "suggest" | "review";

export function LogCallDialog({
  leadId,
  onSuccess,
}: {
  leadId: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("log");
  const [outcome, setOutcome] = useState<CallOutcome | "">("");
  const [notes, setNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const logCall = useLogCallAttempt(leadId, {
    onSuccess: () => {
      onSuccess?.();
      setStep("suggest");
    },
  });
  const generateFollowup = useGenerateCallFollowup(leadId);
  const createReminder = useCreateLeadReminder(leadId);

  const errorMessage = (() => {
    if (localError) return localError;
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!outcome) return;
    setLocalError(null);
    try {
      await logCall.mutateAsync({
        outcome,
        notes: notes.trim() || undefined,
      });
    } catch {
      /* surfaced via errorMessage */
    }
  }

  function resetAndClose() {
    setOpen(false);
    setStep("log");
    setOutcome("");
    setNotes("");
    setLocalError(null);
    generateFollowup.reset();
    createReminder.reset();
  }

  const followup = generateFollowup.data;

  async function handleGenerateSuggestion() {
    if (!outcome) return;
    setLocalError(null);
    try {
      await generateFollowup.mutateAsync({
        callOutcome: outcome,
        agentNotes: notes.trim() || undefined,
      });
      setStep("review");
    } catch (error) {
      setLocalError(getApiErrorMessage(error, "Could not generate suggestion"));
    }
  }

  async function handleCreateReminder() {
    if (!followup) return;
    setLocalError(null);
    try {
      await createReminder.mutateAsync({
        title: followup.suggestedReminder.title,
        note: followup.suggestedReminder.note,
        dueAt: new Date(followup.suggestedReminder.suggestedDueAt),
      });
      onSuccess?.();
      resetAndClose();
    } catch (error) {
      setLocalError(getApiErrorMessage(error, "Could not create reminder"));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetAndClose();
          return;
        }
        setOpen(nextOpen);
      }}
    >
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
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto",
          step === "review" ? "sm:max-w-5xl" : "sm:max-w-lg",
        )}
      >
        {step === "log" ? (
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
                  placeholder="Optional details..."
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
                onClick={resetAndClose}
                disabled={logCall.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={logCall.isPending || !outcome}>
                {logCall.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {step === "suggest" ? (
          <>
            <DialogHeader>
              <DialogTitle>Call logged</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Want AI to suggest a follow-up plan based on this call?
              </p>
              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
                disabled={generateFollowup.isPending}
              >
                Skip
              </Button>
              <Button
                type="button"
                onClick={handleGenerateSuggestion}
                disabled={generateFollowup.isPending}
              >
                {generateFollowup.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestion
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "review" ? (
          <FollowupReview
            followup={followup}
            isCreatingReminder={createReminder.isPending}
            errorMessage={errorMessage}
            onCreateReminder={handleCreateReminder}
            onDiscard={resetAndClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function sectionLabel(text: string) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {text}
    </p>
  );
}

function FollowupReview({
  followup,
  isCreatingReminder,
  errorMessage,
  onCreateReminder,
  onDiscard,
}: {
  followup?: CallFollowUp;
  isCreatingReminder: boolean;
  errorMessage: string | null;
  onCreateReminder: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <DialogHeader className="shrink-0 space-y-1 text-left">
        <DialogTitle className="text-lg">AI follow-up suggestion</DialogTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Review the draft below, then save a reminder or discard.
        </p>
      </DialogHeader>

      {!followup ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading suggestion...
        </div>
      ) : (
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="leading-relaxed">
              AI suggestions can be wrong. Always verify before taking action.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/80 shadow-sm lg:col-span-2">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-base font-semibold">Call script</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-2">
                  {sectionLabel("Opening")}
                  <p className="text-sm leading-relaxed text-foreground">
                    {followup.callScript.opening}
                  </p>
                </div>
                <div className="space-y-2">
                  {sectionLabel("Questions")}
                  <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed marker:font-medium marker:text-muted-foreground">
                    {followup.callScript.questions.map((q, i) => (
                      <li key={i} className="pl-1">
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="space-y-3">
                  {sectionLabel("Objection handlers")}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {followup.callScript.objectionHandlers.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border/80 bg-muted/20 p-4 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {item.objection}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.response}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:col-span-1">
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="text-base font-semibold">
                    Next step
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {followup.recommendedNextStep}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="text-base font-semibold">
                    Suggested reminder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <p className="text-sm font-semibold text-foreground">
                    {followup.suggestedReminder.title}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {followup.suggestedReminder.note}
                  </p>
                  <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Due:</span>{" "}
                    {new Date(
                      followup.suggestedReminder.suggestedDueAt,
                    ).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <DialogFooter className="shrink-0 border-t border-border/60 bg-muted/20 pt-4 sm:justify-end">
        <Button type="button" variant="outline" onClick={onDiscard}>
          Discard
        </Button>
        <Button
          type="button"
          onClick={onCreateReminder}
          disabled={!followup || isCreatingReminder}
        >
          {isCreatingReminder ? "Creating Reminder..." : "Create Reminder"}
        </Button>
      </DialogFooter>
    </div>
  );
}
