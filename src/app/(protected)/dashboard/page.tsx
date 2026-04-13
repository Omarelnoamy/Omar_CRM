import Link from "next/link";
import { getDashboardLeadStats } from "@/services/dashboard/stats";
import { authenticateUser } from "@/utils/authenticateUser";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const profile = await authenticateUser();
  const { total, inProgress, completed } = await getDashboardLeadStats(profile);

  const cards = [
    { label: "Total Leads", value: total },
    { label: "In Progress", value: inProgress },
    { label: "Completed", value: completed },
  ] as const;

  return (
    <div className="flex flex-1 flex-col p-6 md:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Overview of your CRM activity
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-950">
          <p className="font-medium text-sky-900">What&apos;s next</p>
          <p className="mt-1 text-sky-900/90">
            Keep your pipeline up to date on{" "}
            <Link
              href="/leads"
              className="font-medium text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
            >
              Leads
            </Link>
            : create records, edit status and stage, and review the timeline for
            each contact.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 border-sky-300 bg-white text-sky-900 hover:bg-sky-100">
            <Link href="/leads">Go to Leads</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
