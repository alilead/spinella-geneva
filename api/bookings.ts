import { Resend } from "resend";
import { getSupabase, BOOKINGS_TABLE, type BookingRow } from "./_lib/supabase.js";
import { verifySupabaseToken, isAllowedAdmin } from "./_lib/supabaseAuth.js";
import { confirmedEmailHtml } from "./_lib/confirmedEmail.js";

const FROM = "Spinella Geneva <info@spinella.ch>";

/** Email sent to guest when admin declines their reservation request. */
function declineEmailHtml(data: { name: string; date: string; time: string }): string {
  return `
<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#0c0c0c;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #2a2520;">
<tr><td style="padding:32px 24px;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:4px;color:#8a7a5c;">Restaurant &amp; Bar</p>
<h1 style="margin:8px 0 0;font-size:32px;letter-spacing:4px;color:#d4af37;">SPINELLA</h1><p style="margin:4px 0 0;font-size:12px;color:#b8a574;">GENEVA</p></td></tr>
<tr><td style="padding:0 24px 24px;"><p style="margin:0;font-size:16px;color:#e8e4dc;">Bonjour ${data.name},</p>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;">Nous sommes désolés, nous ne pouvons malheureusement pas confirmer votre demande de réservation pour le <strong>${data.date}</strong> à <strong>${data.time}</strong>.</p>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;">N'hésitez pas à nous contacter pour une autre date ou à réserver en ligne.</p></td></tr>
<tr><td style="padding:24px;text-align:center;font-size:13px;color:#8a7a5c;">Rue Liotard 4, 1202 Genève · <a href="tel:+41225034186" style="color:#d4af37;">+41 22 503 41 86</a> · <a href="mailto:info@spinella.ch" style="color:#d4af37;">info@spinella.ch</a></td></tr>
</table></td></tr></table></body></html>`;
}

type Res = { status: (code: number) => { json: (body: object) => void }; setHeader?: (name: string, value: string) => void };

function getAuthTokenFromRequest(req: { headers?: { authorization?: string } }): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}

async function requireAuth(req: { method?: string; headers?: { authorization?: string } }, res: Res): Promise<boolean> {
  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return false;
  }
  const token = getAuthTokenFromRequest(req);
  const user = await verifySupabaseToken(token);
  if (!isAllowedAdmin(user)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export type SentEmailEntry = { id: string; type: string; sentAt: string };
export type SentEmailWithStatus = SentEmailEntry & { status?: string };

export type BookingDoc = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string | null;
  status: string;
  createdAt?: string;
  sentEmails?: SentEmailEntry[];
};

function rowToBooking(row: BookingRow): BookingDoc {
  const sent = row.sent_emails;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    date: row.date,
    time: row.time,
    partySize: row.party_size,
    specialRequests: row.special_requests ?? null,
    status: row.status,
    createdAt: row.created_at,
    sentEmails: Array.isArray(sent) ? sent : [],
  };
}

type Req = {
  method?: string;
  body?: string | object;
  headers?: { authorization?: string };
  query?: { id?: string };
};

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "GET") {
    if (!(await requireAuth(req, res))) return;
    let bookingId = (req as { query?: { id?: string } }).query?.id?.trim();
    if (!bookingId && typeof (req as { url?: string }).url === "string") {
      const u = (req as { url: string }).url;
      const i = u.indexOf("?");
      if (i !== -1) bookingId = new URLSearchParams(u.slice(i)).get("id")?.trim() ?? undefined;
    }
    try {
      const supabase = getSupabase();
      if (bookingId) {
        const { data: row, error } = await supabase
          .from(BOOKINGS_TABLE)
          .select("*")
          .eq("id", bookingId)
          .maybeSingle();
        if (error || !row) {
          res.status(404).json({ error: "Booking not found" });
          return;
        }
        const booking = rowToBooking(row as BookingRow);
        const sentEmails = booking.sentEmails ?? [];
        const resendKey = process.env.RESEND_API_KEY;
        let emailStatuses: SentEmailWithStatus[] = sentEmails.map((e) => ({ ...e }));
        if (resendKey && sentEmails.length > 0) {
          const resend = new Resend(resendKey);
          const statuses = await Promise.all(
            sentEmails.map(async (e) => {
              try {
                const got = await resend.emails.get(e.id);
                const d = (got as { data?: { last_event?: string } }).data;
                return { ...e, status: d?.last_event ?? "unknown" };
              } catch {
                return { ...e, status: "—" };
              }
            })
          );
          emailStatuses = statuses;
        }
        res.status(200).json({ booking, emailStatuses });
        return;
      }
      const { data: rows, error } = await supabase
        .from(BOOKINGS_TABLE)
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });
      if (error) throw error;
      const bookings = (rows ?? []).map((r: BookingRow) => rowToBooking(r));
      res.status(200).json({ bookings });
    } catch (err) {
      console.error("[bookings] GET error:", err);
      res.status(500).json({ error: "Failed to load bookings" });
    }
    return;
  }

  if (req.method === "PATCH") {
    if (!(await requireAuth(req, res))) return;
    let body: unknown;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    } catch {
      res.status(400).json({ error: "Invalid JSON" });
      return;
    }
    const o = body as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : (req as { query?: { id?: string } }).query?.id;
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const status = typeof o.status === "string" ? o.status.trim() : "";
    if (status !== "confirmed" && status !== "pending" && status !== "request" && status !== "cancelled") {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    try {
      const supabase = getSupabase();
      const { data: row, error: fetchErr } = await supabase
        .from(BOOKINGS_TABLE)
        .select("name, email, phone, date, time, party_size, special_requests, status, sent_emails")
        .eq("id", id)
        .maybeSingle();
      if (fetchErr || !row) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      const previousStatus = (row as { status?: string }).status ?? "";
      const prevSent = (row as { sent_emails?: SentEmailEntry[] }).sent_emails ?? [];

      if (status === "confirmed" && row.email) {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          const { data: sendData, error: sendErr } = await resend.emails.send({
            from: FROM,
            to: [row.email],
            subject: `Spinella – Votre réservation est confirmée`,
            html: confirmedEmailHtml({
              name: row.name ?? "Client",
              date: row.date ?? "",
              time: row.time ?? "",
              partySize: row.party_size ?? 0,
              phone: row.phone ?? "",
              specialRequests: row.special_requests ?? null,
            }),
          });
          if (sendErr) console.error("[bookings] Confirmation email failed:", sendErr);
          else {
            const resendId = (sendData as { id?: string })?.id;
            if (resendId) {
              const nextSent = [...prevSent, { id: resendId, type: "confirmed", sentAt: new Date().toISOString() }];
              await supabase.from(BOOKINGS_TABLE).update({ sent_emails: nextSent }).eq("id", id);
            }
          }
        }
      }

      if (status === "cancelled" && (previousStatus === "request" || previousStatus === "pending") && row.email) {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          const { data: sendData, error: sendErr } = await resend.emails.send({
            from: FROM,
            to: [row.email],
            subject: `Spinella – Demande de réservation`,
            html: declineEmailHtml({
              name: row.name ?? "Client",
              date: row.date ?? "",
              time: row.time ?? "",
            }),
          });
          if (sendErr) console.error("[bookings] Decline email failed:", sendErr);
          else {
            const resendId = (sendData as { id?: string })?.id;
            if (resendId) {
              const nextSent = [...prevSent, { id: resendId, type: "decline", sentAt: new Date().toISOString() }];
              await supabase.from(BOOKINGS_TABLE).update({ sent_emails: nextSent }).eq("id", id);
            }
          }
        }
      }

      const { error } = await supabase.from(BOOKINGS_TABLE).update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[bookings] PATCH error:", err);
      res.status(500).json({ error: "Failed to update booking" });
    }
    return;
  }

  if (req.method === "POST") {
    if (!(await requireAuth(req, res))) return;
    let body: unknown;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    } catch {
      res.status(400).json({ error: "Invalid JSON" });
      return;
    }
    const o = body as Record<string, unknown>;
    const list = Array.isArray(o.bookings) ? o.bookings : Array.isArray(o) ? o : [o];
    const toAdd: Array<Record<string, unknown>> = [];
    for (const b of list) {
      const r = b as Record<string, unknown>;
      const name = String(r.name ?? "").trim();
      const date = String(r.date ?? "").slice(0, 10);
      const time = String(r.time ?? "").trim();
      if (!name || !date || !time) continue;
      toAdd.push({
        name,
        email: String(r.email ?? ""),
        phone: String(r.phone ?? ""),
        date,
        time,
        party_size: Number(r.partySize) || Number(r.party_size) || 1,
        special_requests: r.specialRequests != null ? String(r.specialRequests) : r.special_requests != null ? String(r.special_requests) : null,
        status: r.status != null ? String(r.status) : "confirmed",
      });
    }
    if (toAdd.length === 0) {
      res.status(400).json({ error: "No valid bookings to add" });
      return;
    }
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from(BOOKINGS_TABLE).insert(toAdd);
      if (error) throw error;
      res.status(200).json({ ok: true, added: toAdd.length });
    } catch (err) {
      console.error("[bookings] POST error:", err);
      res.status(500).json({ error: "Failed to add bookings" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
