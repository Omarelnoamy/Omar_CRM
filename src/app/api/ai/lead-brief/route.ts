import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser();
    const body = await req.json();

    const { leadId } = AISchema.generateLeadBrief.parse(body);
    const brief = await AIService.generateLeadBrief(leadId, profile);

    return NextResponse.json({ success: true, data: brief });
  } catch (error) {
    return handleRouteError(error);
  }
}
