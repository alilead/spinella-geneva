import { createClient } from "@supabase/supabase-js";

let authClient: ReturnType<typeof createClient> | null = null;

function getAuthClient() {
  if (authClient) return authClient;
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set for auth");
  }
  authClient = createClient(url, anonKey, { auth: { persistSession: false } });
  return authClient;
}

/**
 * Verify a Supabase Auth JWT (access_token). Returns the user or null.
 */
export async function verifySupabaseToken(
  accessToken: string
): Promise<{ id: string; email?: string } | null> {
  if (!accessToken?.trim()) return null;
  try {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    const client = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const result = await client.auth.getUser();
    const user = result?.data?.user;
    const error = result?.error;
    if (error || !user) return null;
    return { id: user.id, email: user.email ?? undefined };
  } catch {
    return null;
  }
}

export function isAllowedAdmin(user: { email?: string } | null): boolean {
  if (!user) return false;
  const allowed = process.env.ADMIN_EMAIL?.trim();
  if (!allowed) return true;
  return user.email?.toLowerCase() === allowed.toLowerCase();
}
