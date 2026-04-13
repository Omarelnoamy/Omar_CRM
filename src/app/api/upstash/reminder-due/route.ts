import { verifyQstashSignature } from "@/lib/qstash";
import {
  ReminderSchema,
  ReminderService,
  ReminderServiceError,
} from "@/services/reminders";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const isValid = await verifyQstashSignature(request, rawBody);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = ReminderSchema.qstash.parse(JSON.parse(rawBody));

    await ReminderService.fire(body.reminderId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Error occured while firing reminder", error);
    if (error instanceof ReminderServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
