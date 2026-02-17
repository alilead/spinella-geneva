/**
 * Send push notifications to all stored admin subscriptions.
 * Used when a new booking is created (api/booking.ts) and by POST /api/push/send.
 */

import webpush from "web-push";
import { getSupabase, PUSH_SUBSCRIPTIONS_TABLE } from "./supabase.js";

export type PushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  url?: string;
  tag?: string;
};

export async function getSubscriptions(): Promise<Array<{ endpoint: string; subscription: PushSubscription }>> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from(PUSH_SUBSCRIPTIONS_TABLE)
    .select("endpoint, subscription");
  if (error) {
    console.error("[Push] Failed to load subscriptions:", error);
    return [];
  }
  const list: Array<{ endpoint: string; subscription: PushSubscription }> = [];
  for (const row of rows ?? []) {
    const r = row as { endpoint: string; subscription: unknown };
    if (r?.endpoint && r?.subscription && typeof r.subscription === "object")
      list.push({ endpoint: r.endpoint, subscription: r.subscription as PushSubscription });
  }
  return list;
}

export async function sendPushToAllSubscriptions(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys not set; skipping push");
    return { sent: 0, failed: 0 };
  }

  webpush.setVapidDetails("mailto:info@spinella.ch", publicKey, privateKey);

  const list = await getSubscriptions();
  if (list.length === 0) {
    console.log("[Push] No subscriptions to send to");
    return { sent: 0, failed: 0 };
  }

  const body = JSON.stringify({
    title: payload.title ?? "Spinella Restaurant",
    body: payload.body ?? "Nouvelle notification",
    icon: payload.icon ?? "/icon-192.png",
    url: payload.url ?? "/admin",
    tag: payload.tag ?? "spinella-notification",
  });

  let sent = 0;
  let failed = 0;
  const supabase = getSupabase();

  for (const { endpoint, subscription } of list) {
    try {
      await webpush.sendNotification(subscription, body);
      sent++;
    } catch (err) {
      failed++;
      console.error("[Push] Failed to send to", endpoint.substring(0, 50), err);
      const statusCode = err && typeof err === "object" && "statusCode" in err ? (err as { statusCode: number }).statusCode : 0;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from(PUSH_SUBSCRIPTIONS_TABLE).delete().eq("endpoint", endpoint);
        console.log("[Push] Removed invalid subscription:", endpoint.substring(0, 50));
      }
    }
  }

  console.log("[Push] Sent", sent, "notifications,", failed, "failed");
  return { sent, failed };
}
