import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// POST /api/ai/call-followup/save
export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser();
    const body = await req.json();

    const data = AISchema.saveCallFollowUp.parse(body);
    const row = await AIService.saveCallFollowUp(data, profile);

    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return handleRouteError(error);
  }
}
