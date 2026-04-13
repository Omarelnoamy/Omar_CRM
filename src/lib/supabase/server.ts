import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  // Initialize the cookie store
  const cookieStore = await cookies();

  // Initialize the Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `cookies().set` is only allowed in Route Handlers and Server Actions (Next.js 15+).
            // Session refresh is handled in `proxy.ts`; RSC layouts may only read cookies.
          }
        },
      },
    },
  );

  return supabase;
}
