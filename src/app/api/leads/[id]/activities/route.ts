import { leadIdParamsSchema } from "@/services/lead/schema";
import { ActivityService, ActivitySchema } from "@/services/activity";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id: leadId } = leadIdParamsSchema.parse(await params);
    const sp = request.nextUrl.searchParams;

    const queryInput = ActivitySchema.getByLeadId.parse({
      leadId,
      page: sp.get("page"),
      pageSize: sp.get("pageSize"),
    });

    const data = await ActivityService.getByLeadId(queryInput, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
