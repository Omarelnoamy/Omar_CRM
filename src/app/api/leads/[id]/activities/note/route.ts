import { ActivityType } from "@/generated/prisma/client";
import { leadIdParamsSchema } from "@/services/lead/schema";
import { getLead } from "@/services/lead/service";
import { createNoteSchema } from "@/services/activity/schema";
import { createActivityItem } from "@/services/activity/service";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id: leadId } = leadIdParamsSchema.parse(await params);
    await getLead(profile, leadId);

    const body = createNoteSchema.parse(await request.json());

    const result = await createActivityItem({
      leadId,
      actorId: profile.id,
      type: ActivityType.NOTE,
      contentOverride: body.content,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.activity });
  } catch (error) {
    return handleRouteError(error);
  }
}
