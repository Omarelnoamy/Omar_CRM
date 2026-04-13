import { Role } from "@/generated/prisma/client";
import { createLeadSchema, listLeadsQuerySchema } from "@/services/lead/schema";
import { createLead, listLeads } from "@/services/lead/service";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const profile = await authenticateUser();
    const sp = request.nextUrl.searchParams;
    const searchRaw = sp.get("search");
    const search =
      searchRaw && searchRaw.trim() !== "" ? searchRaw.trim() : undefined;

    const statusRaw = sp.get("status");
    const stageRaw = sp.get("stage");

    const params = listLeadsQuerySchema.parse({
      page: sp.get("page"),
      pageSize: sp.get("pageSize"),
      search,
      status: statusRaw && statusRaw.trim() !== "" ? statusRaw : undefined,
      stage: stageRaw && stageRaw.trim() !== "" ? stageRaw : undefined,
      createdFrom: sp.get("createdFrom") ?? undefined,
      createdTo: sp.get("createdTo") ?? undefined,
    });

    const data = await listLeads(profile, params);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await authenticateUser([Role.ADMIN, Role.MANAGER]);
    const body = await request.json();
    const data = createLeadSchema.parse(body);
    const lead = await createLead(profile, data);
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return handleRouteError(error);
  }
}
