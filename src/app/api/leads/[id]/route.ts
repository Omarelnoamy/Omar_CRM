import { editLeadSchema, leadIdParamsSchema } from "@/services/lead/schema";
import { getLead, updateLead } from "@/services/lead/service";
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
    const lead = await getLead(profile, id);
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const body = await request.json();
    const data = editLeadSchema.parse(body);
    const result = await updateLead(profile, id, data);
    return NextResponse.json({ success: true, data: result.lead });
  } catch (error) {
    return handleRouteError(error);
  }
}
