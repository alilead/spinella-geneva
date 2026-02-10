import { Resend } from "resend";
import { getSupabase, BOOKINGS_TABLE, type BookingRow } from "./lib/supabase.js";
import { verifySupabaseToken, isAllowedAdmin } from "./lib/supabaseAuth.js";
import { confirmedEmailHtml } from "./lib/confirmedEmail.js";

const FROM = "Spinella Geneva <info@spinella.ch>";

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
};

function rowToBooking(row: BookingRow): BookingDoc {
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
    try {
      const supabase = getSupabase();
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
      if (status === "confirmed") {
        const { data: row, error: fetchErr } = await supabase.from(BOOKINGS_TABLE).select("name, email, phone, date, time, party_size, special_requests").eq("id", id).maybeSingle();
        if (!fetchErr && row?.email) {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            const resend = new Resend(resendKey);
            const { error: sendErr } = await resend.emails.send({
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
