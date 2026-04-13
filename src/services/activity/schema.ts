import { ActivityType, LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { PaginationMeta } from "@/utils/pagination";
import { z } from "zod";

const leadStatusSchema = z.enum(LeadStatus);
const leadStageSchema = z.enum(LeadStage);

export const createNoteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export type CreateNoteRequest = z.infer<typeof createNoteSchema>;

export const callOutcomeEnum = z.enum([
  "NO_ANSWER",
  "ANSWERED",
  "WRONG_NUMBER",
  "BUSY",
  "CALL_BACK_LATER",
]);

export type CallOutcome = z.infer<typeof callOutcomeEnum>;

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  NO_ANSWER: "No answer",
  ANSWERED: "Answered",
  WRONG_NUMBER: "Wrong number",
  BUSY: "Busy",
  CALL_BACK_LATER: "Call back later",
};

export const createCallAttemptSchema = z.object({
  outcome: callOutcomeEnum,
  notes: z.string().trim().max(5000).optional(),
});

export type CreateCallAttemptRequest = z.infer<typeof createCallAttemptSchema>;

export const createAIActivitySchema = z.object({
  type: z.enum([
    ActivityType.AI_LEAD_BRIEF_GENERATED,
    ActivityType.AI_FOLLOWUP_DRAFT_GENERATED,
  ]),
  leadId: z.uuid(),
  actorId: z.uuid(),
  content: z.string().min(1),
});

export type CreateAIActivityRequest = z.infer<typeof createAIActivitySchema>;

const createActivitySchema = z
  .object({
    leadId: z.uuid(),
    actorId: z.uuid(),
    type: z.enum(ActivityType),
    content: z.string().min(1).optional(),
    meta: z
      .object({
        from: z.unknown(),
        to: z.unknown(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      ["STATUS_CHANGE", "STAGE_CHANGE", "ASSIGNMENT_CHANGE"].includes(data.type)
    ) {
      if (!data.meta) {
        ctx.addIssue({
          code: "custom",
          path: ["meta"],
          message: "Meta is required for change activities",
        });
        return;
      }

      switch (data.type) {
        case ActivityType.STATUS_CHANGE: {
          const parsedFrom = leadStatusSchema.safeParse(data.meta.from);
          const parsedTo = leadStatusSchema.safeParse(data.meta.to);
          if (!parsedFrom.success || !parsedTo.success) {
            ctx.addIssue({
              code: "custom",
              path: ["meta"],
              message:
                "Status change activity requires valid LeadStatus values in meta",
            });
          }
          break;
        }
        case ActivityType.STAGE_CHANGE: {
          const parsedFrom = leadStageSchema.safeParse(data.meta.from);
          const parsedTo = leadStageSchema.safeParse(data.meta.to);
          if (!parsedFrom.success || !parsedTo.success) {
            ctx.addIssue({
              code: "custom",
              path: ["meta"],
              message:
                "Stage change activity requires valid LeadStage values in meta",
            });
          }
          break;
        }
        case ActivityType.ASSIGNMENT_CHANGE: {
          const parsedFrom = z.string().safeParse(data.meta.from);
          const parsedTo = z.string().safeParse(data.meta.to);
          if (!parsedFrom.success || !parsedTo.success) {
            ctx.addIssue({
              code: "custom",
              path: ["meta"],
              message:
                "Assignment change activity requires string values in meta",
            });
          }
          break;
        }
        default:
          break;
      }
    }

    if (
      (data.type === ActivityType.NOTE ||
        data.type === ActivityType.CALL_ATTEMPT) &&
      !data.content
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Content is required for note and call attempt activities",
      });
    }
  });

export const createManyActivitiesSchema = z.array(createActivitySchema);

export type CreateActivityRequest = z.infer<typeof createActivitySchema>;

export const getLeadActivitiesSchema = z.object({
  leadId: z.uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type GetLeadActivitiesRequest = z.infer<typeof getLeadActivitiesSchema>;

export type ActivitySummaryItem = {
  id: string;
  actor: {
    name: string;
  };
  type: ActivityType;
  createdAt: Date;
  content: string | null;
};
export type ListLeadActivitiesResponseData = {
  activities: ActivitySummaryItem[];
  pagination: PaginationMeta;
};
