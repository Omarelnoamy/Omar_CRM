import { ActivitySchema, ActivityService } from "@/services/activity";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// GET /api/leads/[id]/activities?page=1&pageSize=10
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: leadId } = await params;
    const profile = await authenticateUser();

    const sp = request.nextUrl.searchParams;
    const validated = ActivitySchema.getByLeadId.parse({
      leadId,
      page: sp.get("page"),
      pageSize: sp.get("pageSize"),
    });

    const data = await ActivityService.getByLeadId(validated, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
