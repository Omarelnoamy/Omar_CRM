"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadBrief } from "@/services/ai/schema";
import { AlertTriangle } from "lucide-react";

export function BriefContent({ brief }: { brief: LeadBrief }) {
  if (!brief) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{brief.summary}</p>
        </CardContent>
      </Card>

      {brief.keyFacts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Key Facts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {brief.keyFacts.map((fact, i) => (
                <span
                  key={i}
                  className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-900"
                >
                  {fact}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {brief.risks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {brief.risks.map((risk, i) => (
                <li key={i} className="flex gap-3 text-sm text-yellow-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {brief.nextActions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recommended Next Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brief.nextActions.map((action, i) => (
              <div key={i} className="rounded border p-3">
                <p className="text-sm font-medium">{action.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{action.why}</p>
                {action.suggestedDueAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Suggested: {action.suggestedDueAt}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {brief.questionsToAskNext.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Questions to Ask Next</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {brief.questionsToAskNext.map((question, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-semibold text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
