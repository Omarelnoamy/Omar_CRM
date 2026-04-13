import type { Profile } from "@/generated/prisma/client";
import { reminderIdParamsSchema } from "@/services/reminders/schema";
import { ReminderSchema, ReminderService } from "@/services/reminders";
import type { UserSnapshot } from "@/utils/types/user";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

function toUserSnapshot(profile: Profile): UserSnapshot {
  return { id: profile.id, role: profile.role };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = reminderIdParamsSchema.parse(await params);
    const body = ReminderSchema.update.parse(await request.json());
    const userSnapshot = toUserSnapshot(profile);

    if (body.status === "CANCELLED") {
      const reminder = await ReminderService.cancel(id, userSnapshot);
      return NextResponse.json({ success: true, data: reminder });
    }

    const reminder = await ReminderService.complete(id, userSnapshot);
    return NextResponse.json({ success: true, data: reminder });
  } catch (error) {
    return handleRouteError(error);
  }
}
