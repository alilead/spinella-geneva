import { Resend } from "resend";
import { getSupabase } from "../lib/supabase.js";
import { verifySupabaseToken, isAllowedAdmin } from "../lib/supabaseAuth.js";
import { VALENTINES_DATE, getBaseUrl, valentinesGuestEmailHtml } from "../lib/valentinesEmail.js";

const FROM = "Spinella Geneva <info@spinella.ch>";
const BOOKINGS_TABLE = "bookings";

type Req = { method?: string; headers?: { authorization?: string } };
type Res = { status: (code: number) => { json: (body: object) => void }; setHeader?: (name: string, value: string) => void };

function getAuthTokenFromRequest(req: Req): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}

const BATCH_SIZE = 3;

type ReqWithBody = Req & { body?: string | { offset?: number; batchSize?: number } };

/** POST: send Valentine's Day email in batches (e.g. 3 every 2 min). Body: { offset?, batchSize? }. Admin only. */
export default async function handler(req: ReqWithBody, res: Res): Promise<void> {
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = getAuthTokenFromRequest(req);
  const user = await verifySupabaseToken(token);
  if (!user || !isAllowedAdmin(user)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    res.status(503).json({ error: "RESEND_API_KEY not set" });
    return;
  }

  let offset = 0;
  let batchSize = BATCH_SIZE;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    offset = Math.max(0, Number(body.offset) || 0);
    batchSize = Math.min(10, Math.max(1, Number(body.batchSize) || BATCH_SIZE));
  } catch {
    /* use defaults */
  }

  try {
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select("name, email")
      .eq("date", VALENTINES_DATE);
    if (error) throw error;

    const guests = (rows ?? []).filter((r: { email?: string }) => r?.email);
    const total = guests.length;
    const batch = guests.slice(offset, offset + batchSize);
    const resend = new Resend(key);
    const flyerUrl = `${getBaseUrl()}/valentines-menu.jpeg`;
    let sent = 0;
    for (const g of batch) {
      const name = (g as { name?: string }).name ?? "Client";
      const email = (g as { email: string }).email;
      const { error: sendErr } = await resend.emails.send({
        from: FROM,
        to: [email],
        subject: "Saint-Valentin à Spinella – Votre table est réservée",
        html: valentinesGuestEmailHtml(name, flyerUrl),
      });
      if (!sendErr) sent++;
      else console.error("[valentines] send failed for", email, sendErr);
    }
    const nextOffset = offset + sent;
    const remaining = total - nextOffset;
    res.status(200).json({ sent, total, remaining, nextOffset });
  } catch (err) {
    console.error("[valentines]", err);
    res.status(500).json({ error: "Failed to send Valentine's emails" });
  }
}
