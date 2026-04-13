"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useCreateNote } from "@/lib/tanstack/useActivities";
import { isAxiosError } from "axios";

export function TimelineNoteForm({
  leadId,
  onSuccess,
}: {
  leadId: string;
  onSuccess?: () => void;
}) {
  const [text, setText] = useState("");
  const createNote = useCreateNote(leadId, { onSuccess });

  const errorMessage = (() => {
    const err = createNote.error;
    if (!err) return null;
    if (isAxiosError(err)) {
      const d = err.response?.data;
      if (d && typeof d === "object" && "error" in d) {
        const e = (d as { error: unknown }).error;
        if (typeof e === "string") return e;
      }
    }
    return getApiErrorMessage(err, "Could not save note");
  })();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await createNote.mutateAsync(trimmed);
      setText("");
    } catch {
      /* surfaced via errorMessage */
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-4 space-y-3"
    >
      <p className="text-sm font-medium">Add note</p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note…"
        rows={4}
        disabled={createNote.isPending}
        aria-invalid={Boolean(errorMessage)}
      />
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <Button
        type="submit"
        disabled={createNote.isPending || text.trim().length === 0}
      >
        {createNote.isPending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
