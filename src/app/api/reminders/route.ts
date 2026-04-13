import type { Profile } from "@/generated/prisma/client";
import { ReminderSchema, ReminderService } from "@/services/reminders";
import type { UserSnapshot } from "@/utils/types/user";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

function toUserSnapshot(profile: Profile): UserSnapshot {
  return { id: profile.id, role: profile.role };
}

/** GET /api/reminders — current user’s reminders (list + create-by-lead live under `/api/leads/:id/reminders`). */
export async function GET(request: NextRequest) {
  try {
    const profile = await authenticateUser();
    const searchParams = request.nextUrl.searchParams;
    const validated = ReminderSchema.listMy.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      status: searchParams.get("status") || undefined,
      assignedToId: searchParams.get("assignedToId") || undefined,
      overdueOnly: searchParams.get("overdueOnly") || undefined,
      includeFired: searchParams.get("includeFired") || undefined,
    });
    const data = await ReminderService.listMy(
      validated,
      toUserSnapshot(profile),
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
