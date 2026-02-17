/**
 * Send push notifications to subscribed clients (admin only).
 * Subscriptions are stored in Supabase; also sent automatically when a new booking is created (api/booking.ts).
 */

import { verifySupabaseToken, isAllowedAdmin } from "../_lib/supabaseAuth.js";
import { sendPushToAllSubscriptions, getSubscriptions } from "../_lib/pushSend.js";

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

  const token = getAuthToken(req);
  const user = await verifySupabaseToken(token);
  if (!isAllowedAdmin(user)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const payload = body as { title?: string; body?: string; icon?: string; url?: string; tag?: string };
  const list = await getSubscriptions();
  const { sent, failed } = await sendPushToAllSubscriptions({
    title: payload.title,
    body: payload.body,
    icon: payload.icon,
    url: payload.url,
    tag: payload.tag,
  });

  res.status(200).json({
    success: true,
    sent,
    failed,
    total: list.length,
  });
}
