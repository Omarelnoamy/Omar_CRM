import { LeadServiceError } from "@/services/lead/service";
import { AuthenticationError } from "./authenticateUser";
import { ZodError } from "zod";
import { NextResponse } from "next/server";

export const handleRouteError = (error: unknown) => {
  if (
    error instanceof AuthenticationError ||
    error instanceof LeadServiceError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};
