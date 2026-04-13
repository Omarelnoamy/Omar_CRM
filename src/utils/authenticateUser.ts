import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function authenticateUser(allowedRoles?: Role[]) {
  //step1 : Get the user from the database
  const supabase = await createSupabaseServerClient();
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("rate limit")) {
        throw new AuthenticationError("Request rate limit reached", 429);
      }
    }
    throw new AuthenticationError("Authentication service unavailable", 503);
  }

  //step2 : If no user return error message
  if (!user) {
    throw new AuthenticationError("Unauthorized", 401);
  }

  //step3 : fetch user from the database
  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!profile) {
    throw new AuthenticationError("User not found", 404);
  }

  if (!profile.isActive) {
    throw new AuthenticationError("User is not active", 403);
  }
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new AuthenticationError("Unauthorized", 403);
  }

  return profile;
}
