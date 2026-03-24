import {
  authenticateUser,
  AuthenticationError,
} from "@/utils/authenticateUser";
import { NextRequest, NextResponse } from "next/server";
import { ListedLeadsSchema } from "@/services/leads/schema";
import { ZodError } from "zod";
import { ListLeads } from "@/services/leads/service";

export async function GET(request: NextRequest) {
  try {
    //authenticate user
    const profile = await authenticateUser();

    //get query params
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    //validate query params
    const params = ListedLeadsSchema.parse({
      page,
      pageSize,
    });

    //get leads
    const leads = await ListLeads(profile, params);

    //return response
    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
