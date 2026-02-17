/**
 * Store push notification subscriptions in Supabase
 * so they persist across serverless invocations and can be used when a new booking is created.
 */

import { verifySupabaseToken, isAllowedAdmin } from "../_lib/supabaseAuth.js";
import { getSupabase, PUSH_SUBSCRIPTIONS_TABLE } from "../_lib/supabase.js";

type Res = { status: (code: number) => { json: (body: object) => void }; setHeader?: (name: string, value: string) => void };

function getAuthToken(req: { headers?: { authorization?: string } }): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}

export default async function handler(
  req: { method?: string; body?: string | object; headers?: { authorization?: string } },
  res: Res
): Promise<void> {
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Require authentication
  const token = getAuthToken(req);
  const user = await verifySupabaseToken(token);
  if (!isAllowedAdmin(user)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const subscription = body as PushSubscription;

  if (!subscription || !subscription.endpoint) {
    res.status(400).json({ error: "Invalid subscription" });
    return;
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from(PUSH_SUBSCRIPTIONS_TABLE)
      .upsert(
        { endpoint: subscription.endpoint, subscription: subscription as unknown as object },
        { onConflict: "endpoint" }
      );
    if (error) {
      console.error("[Push] Failed to store subscription:", error);
      res.status(500).json({ error: "Failed to store subscription" });
      return;
    }
    console.log("[Push] Stored subscription for", subscription.endpoint.substring(0, 50) + "...");
    res.status(200).json({ success: true, message: "Subscription stored" });
  } catch (e) {
    console.error("[Push] Error storing subscription:", e);
    res.status(500).json({ error: "Failed to store subscription" });
  }
}
