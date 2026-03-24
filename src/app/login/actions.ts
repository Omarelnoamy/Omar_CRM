"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapSupabaseMessage(message: string): string {
  if (/missing email or phone/i.test(message)) {
    return "Missing email or password.";
  }
  return message;
}

export type LoginResult = { ok: true } | { ok: false; message: string };

async function emailExistsInAuth(
  trimmedEmail: string,
): Promise<boolean | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const listRes = await fetch(
    `${url}/auth/v1/admin/users?filter=${encodeURIComponent(trimmedEmail)}&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      cache: "no-store",
    },
  );

  if (!listRes.ok) return null;

  const listJson = (await listRes.json()) as {
    users?: Array<{ email?: string | null }>;
  };
  const normalized = trimmedEmail.toLowerCase();
  return (listJson.users ?? []).some(
    (u) => (u.email ?? "").toLowerCase() === normalized,
  );
}

function isGenericCredentialFailure(message: string): boolean {
  return /invalid login|invalid credentials|invalid grant|email or password/i.test(
    message,
  );
}

/**
 * Signs in and sets session cookies on the server. After a failed attempt, uses
 * the Admin API (requires SUPABASE_SERVICE_ROLE_KEY) to tell unknown email
 * apart from wrong password. This reveals whether an email is registered.
 */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, message: "Missing email." };
  }
  if (!password) {
    return { ok: false, message: "Missing password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (!error) {
    return { ok: true };
  }

  const raw = error.message;

  if (/missing email or phone/i.test(raw)) {
    return { ok: false, message: "Missing email or password." };
  }
  if (/email not confirmed|confirm your email|not verified/i.test(raw)) {
    return { ok: false, message: mapSupabaseMessage(raw) };
  }
  if (/rate limit|too many requests/i.test(raw)) {
    return { ok: false, message: mapSupabaseMessage(raw) };
  }

  if (!isGenericCredentialFailure(raw)) {
    return { ok: false, message: mapSupabaseMessage(raw) };
  }

  const exists = await emailExistsInAuth(trimmedEmail);
  if (exists === null) {
    return { ok: false, message: mapSupabaseMessage(raw) };
  }
  if (!exists) {
    return {
      ok: false,
      message:
        "No account uses this email.Check the address or contact your admin.",
    };
  }

  return {
    ok: false,
    message:
      "That password doesn't match this account. Try again or reset your password.",
  };
}
