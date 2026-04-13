import type { CallOutcome } from "../activity";
import type { UserSnapshot } from "@/utils/types/user";
import {
  dbGetLeadWithContext,
  dbGetNextReminder,
  dbGetRecentActivities,
} from "./db";

type LeadContext = Awaited<ReturnType<typeof dbGetLeadWithContext>>;
type RecentActivities = Awaited<ReturnType<typeof dbGetRecentActivities>>;
type NextReminder = Awaited<ReturnType<typeof dbGetNextReminder>>;

function formatLeadContext(leadContext: LeadContext) {
  if (!leadContext) return "No lead context found";

  return `
Name: ${leadContext.name}
Email: ${leadContext.email}
Phone: ${leadContext.phone}
Stage: ${leadContext.stage}
Status: ${leadContext.status}
Assigned to: ${leadContext.assignedTo?.name ?? "Unassigned"}
Created: ${leadContext.createdAt.toLocaleDateString("en-US")}
`.trim();
}

function formatRecentActivities(recentActivities: RecentActivities) {
  if (recentActivities.length === 0) return "No recent activities found";

  return recentActivities
    .map((a) => {
      const date = a.createdAt.toLocaleDateString("en-US");
      const content = a.content || "(no content)";
      return `[${date}] ${a.actor.name} — ${a.type}: ${content}`;
    })
    .join("\n");
}

function formatNextReminder(nextReminder: NextReminder) {
  if (!nextReminder) return "No upcoming reminder found";

  const dueDate = nextReminder.dueAt.toLocaleDateString("en-US");
  return `${nextReminder.title} (due ${dueDate}): ${nextReminder.note || "No additional notes"}`;
}

export function buildLeadBriefPrompt(args: {
  leadContext: LeadContext;
  recentActivities: RecentActivities;
  nextReminder: NextReminder;
}): string {
  const { leadContext, recentActivities, nextReminder } = args;
  const leadContextText = formatLeadContext(leadContext);
  const recentActivitiesText = formatRecentActivities(recentActivities);
  const nextReminderText = formatNextReminder(nextReminder);

  return `You are a CRM operations assistant. Generate a structured brief for a sales agent based ONLY on the data provided below. Do not invent facts. If information is missing or unclear, state "Not enough data to assess."

=== LEAD DATA ===
${leadContextText}

=== RECENT ACTIVITY (Most Recent First) ===
${recentActivitiesText}

=== NEXT REMINDER ===
${nextReminderText}

=== YOUR TASK ===
Generate a brief for the agent. Include:
1. A summary of the lead and current situation
2. Key facts the agent should know (based on activity patterns and stage)
3. Potential risks or concerns
4. Recommended next actions with clear reasoning
5. Specific questions to ask on the next call

Focus on actionable insights. Be specific. Use only the data provided.`;
}

export function buildCallFollowupPrompt(args: {
  leadContext: LeadContext;
  recentActivities: RecentActivities;
  callOutcome: CallOutcome;
  agentNotes?: string | null;
}): string {
  const { leadContext, recentActivities, callOutcome, agentNotes } = args;
  const leadContextText = formatLeadContext(leadContext);
  const recentActivitiesText = formatRecentActivities(recentActivities);

  return `You are a sales coach. A sales agent just completed a call with a lead. Based ONLY on the data provided below, suggest a follow-up strategy. Do not invent facts about the lead or their needs.

=== LEAD DATA ===
${leadContextText}

=== RECENT ACTIVITY ===
${recentActivitiesText}

=== THIS CALL ===
Outcome: ${callOutcome}
Agent Notes: ${agentNotes || "None provided"}

=== YOUR TASK ===
Suggest:
1. A personalized opening for the next call (reference something from this call or history)
2. Three specific follow-up questions based on what was discussed
3. Two common objections this lead might raise, and how to handle them
4. The single most important next step for the agent
5. A suggested reminder (due date in YYYY-MM-DD format, title, and context)

Be specific. Reference details from the call and history. Adapt to the lead's stage and situation.`;
}

export const validateLeadAccess = (
  assignedToId: string | null | undefined,
  userSnapshot: UserSnapshot,
) => {
  if (["ADMIN", "MANAGER"].includes(userSnapshot.role)) {
    return true;
  }
  if (userSnapshot.id === assignedToId) {
    return true;
  }
  return false;
};
