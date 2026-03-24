import { z } from "zod";

export const ListedLeadsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListedLeadsParams = z.infer<typeof ListedLeadsSchema>;
