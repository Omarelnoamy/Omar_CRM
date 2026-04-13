import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { PaginationMeta } from "@/utils/pagination";
import { z } from "zod";

const optionalDayString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
);

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  stage: z.nativeEnum(LeadStage).optional(),
  createdFrom: optionalDayString,
  createdTo: optionalDayString,
});

export type ListLeadsParams = z.infer<typeof listLeadsQuerySchema>;

export const createLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8).max(15),
  email: z.email(),
  note: z.string().optional(),
});

export type CreateLeadRequest = z.infer<typeof createLeadSchema>;

export const leadIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type LeadIdParams = z.infer<typeof leadIdParamsSchema>;

export const editLeadSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(8).max(15).optional(),
  email: z.email().optional(),
  stage: z.nativeEnum(LeadStage).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  assignedToId: z.union([z.string().uuid(), z.null()]).optional(),
});

export type EditLeadRequest = z.infer<typeof editLeadSchema>;

export interface LeadAssigneeSummary {
  id: string;
  name: string;
  email: string;
}

export interface LeadSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
  stage: LeadStage;
  status: LeadStatus;
  createdAt: Date;
  assignedToId: string | null;
  assignedTo: LeadAssigneeSummary | null;
}

export interface LeadDetail extends LeadSummary {
  updatedAt: Date;
}

export interface ListLeadsResponseData {
  leads: LeadSummary[];
  pagination: PaginationMeta;
}
