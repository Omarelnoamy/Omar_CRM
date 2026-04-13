import { AIService } from "@/services/ai";
import { leadIdParamsSchema } from "@/services/lead/schema";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);

    const leadBrief = await AIService.getLastLeadBrief(id, profile);
    return NextResponse.json({ success: true, data: { leadBrief } });
  } catch (error) {
    return handleRouteError(error);
  }
}
