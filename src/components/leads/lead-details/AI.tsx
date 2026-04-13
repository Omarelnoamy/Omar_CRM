"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  useGenerateLeadBrief,
  useGetBrief,
  useSaveBrief,
} from "@/lib/tanstack/useAI";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { BriefContent } from "./BriefContent";

function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-md border bg-amber-50 p-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>AI suggestions can be wrong. Always verify before taking action.</p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export const AI = ({ leadId }: { leadId: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [isGeneratedBriefOpen, setIsGeneratedBriefOpen] = useState(false);

  const generateBrief = useGenerateLeadBrief(leadId);
  const saveBrief = useSaveBrief(leadId);
  const { data: briefResponse, isPending: isLoadingBrief } = useGetBrief(leadId);

  const brief = briefResponse?.leadBrief?.brief;
  const generatedBrief = generateBrief.data;
  const isPending = generateBrief.isPending;

  const handleGenerate = () => {
    setError(null);
    generateBrief.mutate(undefined, {
      onError: (err) => {
        setError(getApiErrorMessage(err, "Failed to generate brief"));
      },
      onSuccess: () => {
        setIsGeneratedBriefOpen(true);
      },
    });
  };

  const handleSave = () => {
    if (!generatedBrief) return;
    saveBrief.mutate(generatedBrief, {
      onError: (err) => {
        setError(getApiErrorMessage(err, "Failed to save brief"));
      },
      onSuccess: () => {
        setIsGeneratedBriefOpen(false);
      },
    });
  };

  if (isLoadingBrief) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading brief...</span>
      </div>
    );
  }

  return (
    <>
      {!brief ? (
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            AI will analyze this lead&apos;s activity history and suggest actions.
          </p>
          <Disclaimer />
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Brief...
              </>
            ) : (
              "Generate Lead Brief"
            )}
          </Button>
          {error ? <ErrorMessage message={error} /> : null}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Generated Brief</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isPending ? "Generating..." : "Regenerate"}
            </Button>
          </div>

          <Disclaimer />
          <BriefContent brief={brief} />
          {error ? <ErrorMessage message={error} /> : null}
        </div>
      )}

      <Dialog open={isGeneratedBriefOpen} onOpenChange={setIsGeneratedBriefOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI-Generated Brief</DialogTitle>
          </DialogHeader>
          {generatedBrief ? (
            <div className="space-y-4">
              <Disclaimer />
              <BriefContent brief={generatedBrief} />
              <DialogFooter>
                <Button onClick={handleSave} disabled={saveBrief.isPending}>
                  {saveBrief.isPending ? "Saving..." : "Save Brief"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating brief...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
