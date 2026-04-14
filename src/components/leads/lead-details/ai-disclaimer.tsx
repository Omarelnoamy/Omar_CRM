import { AlertTriangle } from "lucide-react";

export function AIDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200/80 bg-amber-50 p-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <p className="leading-relaxed">
        AI suggestions can be wrong. Always verify before taking action.
      </p>
    </div>
  );
}
