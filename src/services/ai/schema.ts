import { z } from "zod";

export const leadBriefSchema = z.object({
  summary: z
    .string()
    .max(1000)
    .describe("A brief summary of the lead's situation based on activity history."),
  keyFacts: z
    .array(z.string().max(100))
    .min(2)
    .max(5)
    .describe(
      "2-5 bullet points about the lead (stage, activity pattern, engagement level, etc.)",
    ),
  risks: z
    .array(z.string().max(100))
    .max(3)
    .describe("up to 3 risks the lead is facing or objections"),
  nextActions: z
    .array(
      z.object({
        action: z.string().describe("The specific action to take"),
        why: z.string().describe("Why this action matters"),
        suggestedDueAt: z
          .string()
          .optional()
          .describe("Optional suggested due date (e.g., 'in 3 days', 'this week')"),
      }),
    )
    .max(3)
    .describe("Up to 3 recommended next actions with reasoning"),
  questionsToAskNext: z
    .array(z.string())
    .max(3)
    .describe("Up to 3 specific questions to ask the lead on the next call"),
});

export type LeadBrief = z.infer<typeof leadBriefSchema>;

export const callFollowUpSchema = z.object({
  callScript: z.object({
    opening: z
      .string()
      .describe(
        "A suggested opening for the next call referencing last conversation",
      ),
    questions: z
      .array(z.string())
      .length(3)
      .describe("3 specific questions to ask based on the lead's situation"),
    objectionHandlers: z
      .array(
        z.object({
          objection: z
            .string()
            .describe("A potential objection the lead might raise"),
          response: z
            .string()
            .describe("How to handle this objection professionally"),
        }),
      )
      .length(2)
      .describe("2 common objections and how to handle them"),
  }),
  recommendedNextStep: z
    .string()
    .describe("The single most important next step after this call"),
  suggestedReminder: z.object({
    title: z.string().describe("Short, actionable reminder title"),
    note: z.string().describe("Context for the reminder"),
    // ISO-8601 string only: z.date() cannot be converted to JSON Schema for Output.object().
    suggestedDueAt: z
      .string()
      .describe(
        "Suggested due date and time as ISO-8601 (e.g. 2026-04-15T14:00:00.000Z)",
      ),
  }),
});

export type CallFollowUp = z.infer<typeof callFollowUpSchema>;

export const generateLeadBriefSchema = z.object({
  leadId: z.uuid(),
});

export const saveLeadBriefSchema = z.object({
  leadId: z.uuid(),
  brief: leadBriefSchema,
});

export type SaveLeadBriefRequest = z.infer<typeof saveLeadBriefSchema>;

export const generateCallFollowUpRequestSchema = z.object({
  leadId: z.uuid(),
  callOutcome: z.enum([
    "NO_ANSWER",
    "ANSWERED",
    "WRONG_NUMBER",
    "BUSY",
    "CALL_BACK_LATER",
  ]),
  agentNotes: z.string().trim().max(5000).optional(),
});

export type GenerateCallFollowUpRequest = z.infer<
  typeof generateCallFollowUpRequestSchema
>;

export const saveCallFollowUpSchema = z.object({
  leadId: z.uuid(),
  followup: callFollowUpSchema,
});

export type SaveCallFollowUpRequest = z.infer<typeof saveCallFollowUpSchema>;
