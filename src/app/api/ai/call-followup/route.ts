import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// POST /api/ai/call-followup
export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser();
    const body = await req.json();

    const { leadId, callOutcome, agentNotes } =
      AISchema.generateCallFollowup.parse(body);
    const followup = await AIService.generateCallFollowup(
      leadId,
      callOutcome,
      agentNotes,
      profile,
    );

    return NextResponse.json({ success: true, data: followup });
  } catch (error) {
    return handleRouteError(error);
  }
}
