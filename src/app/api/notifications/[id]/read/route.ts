import {
  notificationIdParamsSchema,
  NotificationService,
} from "@/services/notification";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/notifications/[id]/read
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = notificationIdParamsSchema.parse(await params);
    const data = await NotificationService.markRead(profile, id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
