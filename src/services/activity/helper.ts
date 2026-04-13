import { ActivityType } from "@/generated/prisma/enums";

export function buildActivityContent(
  activityType: ActivityType,
  meta:
    | {
        from: unknown;
        to: unknown;
      }
    | undefined,
  content?: string,
) {
  if (
    activityType === ActivityType.NOTE ||
    activityType === ActivityType.CALL_ATTEMPT
  ) {
    return content ?? null;
  }

  if (!meta) {
    return null;
  }

  switch (activityType) {
    case ActivityType.STATUS_CHANGE:
      return `Status changed from ${meta.from} to ${meta.to}`;
    case ActivityType.STAGE_CHANGE:
      return `Stage changed from ${meta.from} to ${meta.to}`;
    case ActivityType.ASSIGNMENT_CHANGE:
      return `Assignment changed from ${meta.from} to ${meta.to}`;
    default:
      return null;
  }
}
