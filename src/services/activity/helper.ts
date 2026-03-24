import { ActivityType } from "@/generated/prisma/enums";

export function buildActivityContent(
  activityType: ActivityType,
  meta:
    | {
        from: unknown;
        to: unknown;
      }
    | undefined,
) {
  if (!meta) {
    return null;
  }

  console.log(meta);

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
