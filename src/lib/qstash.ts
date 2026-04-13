import { Client, Receiver } from "@upstash/qstash";
import { NextRequest } from "next/server";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

export async function verifyQstashSignature(
  request: NextRequest,
  rawBody: string,
): Promise<boolean> {
  const signature = request.headers.get("Upstash-Signature");
  if (!signature) return false;
  return qstashReceiver.verify({ signature, body: rawBody });
}

/** Must match `src/app/api/upstash/reminder-due/route.ts`. */
export const reminderCallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/upstash/reminder-due`;
