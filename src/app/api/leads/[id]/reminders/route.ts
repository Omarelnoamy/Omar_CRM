import type { Profile } from "@/generated/prisma/client";
import { leadIdParamsSchema } from "@/services/lead/schema";
import { ReminderSchema, ReminderService } from "@/services/reminders";
import type { UserSnapshot } from "@/utils/types/user";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

function toUserSnapshot(profile: Profile): UserSnapshot {
  return { id: profile.id, role: profile.role };
}

/** GET /api/leads/:id/reminders */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const searchParams = request.nextUrl.searchParams;
    const validated = ReminderSchema.listByLead.parse({
      leadId: id,
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      status: searchParams.get("status") || undefined,
    });
    const data = await ReminderService.listByLead(
      validated,
      toUserSnapshot(profile),
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** POST /api/leads/:id/reminders */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const data = ReminderSchema.createForLead.parse(await request.json());
    const reminder = await ReminderService.create(
      { ...data, leadId: id },
      toUserSnapshot(profile),
    );
    return NextResponse.json({ success: true, data: reminder });
  } catch (error) {
    return handleRouteError(error);
  }
}
