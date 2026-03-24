import { Role } from "@/generated/prisma/enums";

export type UserSnapshot = {
  id: string;
  role: Role;
};
