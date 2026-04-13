import { UserSnapshot } from "@/utils/types/user";

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
