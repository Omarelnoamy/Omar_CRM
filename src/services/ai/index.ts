import {
  generateCallFollowUpRequestSchema,
  generateLeadBriefSchema,
  saveCallFollowUpSchema,
  saveLeadBriefSchema,
} from "./schema";
import {
  AIServiceError,
  generateCallFollowup,
  generateLeadBrief,
  getLastLeadBrief,
  saveCallFollowUp,
  saveLeadBrief,
} from "./service";

export const AIService = {
  generateLeadBrief,
  generateCallFollowup,
  saveCallFollowUp,
  saveLeadBrief,
  getLastLeadBrief,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  generateCallFollowup: generateCallFollowUpRequestSchema,
  saveCallFollowUp: saveCallFollowUpSchema,
  saveLeadBrief: saveLeadBriefSchema,
} as const;

export type {
  CallFollowUp,
  GenerateCallFollowUpRequest,
  LeadBrief,
  SaveCallFollowUpRequest,
  SaveLeadBriefRequest,
} from "./schema";

export { AIServiceError };
