import { Role } from "@/generated/prisma/client";
import { dbListAssignableProfiles } from "@/services/lead/db";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await authenticateUser([Role.ADMIN, Role.MANAGER]);
    const data = await dbListAssignableProfiles();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
