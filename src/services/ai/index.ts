import { generateLeadBriefSchema, saveLeadBriefSchema } from "./schema";
import { generateLeadBrief, getLastLeadBrief, saveLeadBrief } from "./service";

export const AIService = {
  generateLeadBrief,
  saveLeadBrief,
  getLastLeadBrief,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  saveLeadBrief: saveLeadBriefSchema,
} as const;

export type {
  CallFollowUp,
  LeadBrief,
  SaveLeadBriefRequest,
} from "./schema";
