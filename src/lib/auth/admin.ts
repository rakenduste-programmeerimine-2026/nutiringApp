import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client. Server only: never import this from client components.
 * Needed for the login-security tables and functions, which normal users cannot reach.
 */
export function createAdminClient() {
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
