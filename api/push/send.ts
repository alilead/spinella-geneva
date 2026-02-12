/**
 * Send push notifications to subscribed clients
 * Admin only - can be called from server when new bookings arrive
 */

import webpush from "web-push";
import { verifySupabaseToken, isAllowedAdmin } from "../_lib/supabaseAuth.js";
import { subscriptions } from "./subscribe.js";

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

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }

  // Set VAPID details
  webpush.setVapidDetails(
    'mailto:info@spinella.ch',
    publicKey,
    privateKey
  );

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const payload = body as {
    title?: string;
    body?: string;
    icon?: string;
    url?: string;
    tag?: string;
  };

  const notificationPayload = JSON.stringify({
    title: payload.title || 'Spinella Restaurant',
    body: payload.body || 'Nouvelle notification',
    icon: payload.icon || '/icon-192.png',
    badge: '/icon-192.png',
    url: payload.url || '/',
    tag: payload.tag || 'spinella-notification',
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Send to all subscribed clients
  for (const [endpoint, subscription] of subscriptions.entries()) {
    try {
      await webpush.sendNotification(subscription, notificationPayload);
      sent++;
    } catch (error) {
      failed++;
      console.error(`[Push] Failed to send to ${endpoint.substring(0, 50)}:`, error);
      
      // Remove invalid subscriptions
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          subscriptions.delete(endpoint);
          console.log(`[Push] Removed invalid subscription: ${endpoint.substring(0, 50)}`);
        }
      }
      
      errors.push(`${endpoint.substring(0, 30)}: ${error}`);
    }
  }

  console.log(`[Push] Sent ${sent} notifications, ${failed} failed`);

  res.status(200).json({
    success: true,
    sent,
    failed,
    total: subscriptions.size,
    errors: errors.length > 0 ? errors : undefined,
  });
}
