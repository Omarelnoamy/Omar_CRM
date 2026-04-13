import {
  generateCallFollowUpRequestSchema,
  generateLeadBriefSchema,
  saveLeadBriefSchema,
} from "./schema";
import {
  AIServiceError,
  generateCallFollowup,
  generateLeadBrief,
  getLastLeadBrief,
  saveLeadBrief,
} from "./service";

export const AIService = {
  generateLeadBrief,
  generateCallFollowup,
  saveLeadBrief,
  getLastLeadBrief,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  generateCallFollowup: generateCallFollowUpRequestSchema,
  saveLeadBrief: saveLeadBriefSchema,
} as const;

export type {
  CallFollowUp,
  GenerateCallFollowUpRequest,
  LeadBrief,
  SaveLeadBriefRequest,
} from "./schema";

export { AIServiceError };
