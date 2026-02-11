import { Resend } from "resend";
import { getSupabase, CLIENTS_TABLE, BOOKINGS_TABLE, type ClientRow } from "./_lib/supabase.js";
import { verifySupabaseToken, isAllowedAdmin } from "./_lib/supabaseAuth.js";

type Res = { status: (code: number) => { json: (body: object) => void }; setHeader?: (name: string, value: string) => void };

function getAuthToken(req: { headers?: { authorization?: string } }): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}

async function requireAuth(req: { method?: string }, res: Res): Promise<boolean> {
  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return false;
  }
  const token = getAuthToken(req);
  const user = await verifySupabaseToken(token);
  if (!isAllowedAdmin(user)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export type ClientDoc = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  createdAt?: string;
  lastBookingDate?: string | null;
};

function rowToClient(r: ClientRow, lastBookingDate?: string | null): ClientDoc {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? null,
    source: r.source ?? "booking",
    createdAt: r.created_at,
    lastBookingDate: lastBookingDate ?? null,
  };
}

export default async function handler(
  req: { method?: string; body?: string | object; headers?: { authorization?: string } },
  res: Res
): Promise<void> {
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "GET") {
    if (!(await requireAuth(req, res))) return;
    try {
      const supabase = getSupabase();
      // Fetch all clients (Supabase default limit is 1000; paginate to get all)
      const PAGE = 1000;
      let rows: ClientRow[] = [];
      let from = 0;
      while (true) {
        const { data: page, error } = await supabase
          .from(CLIENTS_TABLE)
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        const list = (page ?? []) as ClientRow[];
        rows = rows.concat(list);
        if (list.length < PAGE) break;
        from += PAGE;
      }
      // Fetch all bookings for lastBookedByEmail (paginate if needed)
      let bookingRows: Array<{ email?: string; date?: string }> = [];
      let bFrom = 0;
      while (true) {
        const { data: bPage, error: bErr } = await supabase
          .from(BOOKINGS_TABLE)
          .select("email, date")
          .range(bFrom, bFrom + PAGE - 1);
        if (bErr) throw bErr;
        const list = (bPage ?? []) as Array<{ email?: string; date?: string }>;
        bookingRows = bookingRows.concat(list);
        if (list.length < PAGE) break;
        bFrom += PAGE;
      }
      const lastBookedByEmail = new Map<string, string>();
      for (const b of bookingRows) {
        const email = b.email?.toLowerCase?.();
        const date = b.date;
        if (!email || !date) continue;
        const current = lastBookedByEmail.get(email);
        if (!current || date > current) lastBookedByEmail.set(email, date);
      }
      const clients = rows.map((r: ClientRow) =>
        rowToClient(r, lastBookedByEmail.get(r.email?.toLowerCase?.()) ?? null)
      );
      res.status(200).json({ clients });
    } catch (err) {
      console.error("[clients] GET error:", err);
      res.status(500).json({ error: "Failed to load clients" });
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
    const o = body as {
      clients?: Array<{ name: string; email: string; phone?: string | null }>;
      name?: string;
      email?: string;
      phone?: string | null;
      syncFromBookings?: boolean;
      syncFromResend?: boolean;
    };

    // Sync Resend sent-email recipients into clients (source "resend") and actualise bookings from Resend.
    if (o.syncFromResend === true) {
      const key = process.env.RESEND_API_KEY;
      if (!key) {
        res.status(503).json({ error: "Resend not configured", details: "RESEND_API_KEY not set" });
        return;
      }
      try {
        const resend = new Resend(key);
        const allEmails = new Set<string>();
        type ResendItem = { email: string; resendId: string; sentAt: string };
        const resendItems: ResendItem[] = [];
        let after: string | undefined;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        do {
          const list = await resend.emails.list({ limit: 100, ...(after ? { after } : {}) });
          const err = (list as { error?: unknown }).error;
          if (err) throw err;
          const listData = list as {
            data?: {
              data?: Array<{ id: string; to?: string[]; created_at?: string }>;
              has_more?: boolean;
            };
          };
          const data = listData.data;
          const items = data?.data ?? [];
          for (const item of items) {
            const sentAt = item.created_at ?? new Date().toISOString();
            const dateOnly = sentAt.slice(0, 10);
            for (const addr of item.to ?? []) {
              const e = typeof addr === "string" ? addr : (addr as { email?: string })?.email;
              const normalized = String(e ?? "").trim().toLowerCase();
              if (normalized && emailRegex.test(normalized)) {
                allEmails.add(normalized);
                resendItems.push({ email: normalized, resendId: item.id, sentAt });
              }
            }
          }
          after = items.length > 0 ? items[items.length - 1].id : undefined;
          if (!data?.has_more) break;
        } while (after);
        const supabase = getSupabase();

        // 1) Sync clients: add new recipients as clients (fetch all existing emails; Supabase default limit 1000)
        let existingClientEmails: Array<{ email: string }> = [];
        let ecFrom = 0;
        const CLIENT_PAGE = 1000;
        while (true) {
          const { data: page, error: fetchErr } = await supabase
            .from(CLIENTS_TABLE)
            .select("email")
            .range(ecFrom, ecFrom + CLIENT_PAGE - 1);
          if (fetchErr) throw fetchErr;
          const list = (page ?? []) as Array<{ email: string }>;
          existingClientEmails = existingClientEmails.concat(list);
          if (list.length < CLIENT_PAGE) break;
          ecFrom += CLIENT_PAGE;
        }
        const existingEmails = new Set(existingClientEmails.map((r) => r.email?.toLowerCase?.() ?? ""));
        const toInsert = Array.from(allEmails).filter((e) => !existingEmails.has(e));
        const BATCH = 100;
        let imported = 0;
        for (let i = 0; i < toInsert.length; i += BATCH) {
          const batch = toInsert.slice(i, i + BATCH).map((email) => ({
            name: email,
            email,
            phone: null,
            source: "resend",
            updated_at: new Date().toISOString(),
          }));
          const { error: insertErr } = await supabase.from(CLIENTS_TABLE).insert(batch);
          if (insertErr) throw insertErr;
          imported += batch.length;
        }

        // 2) Actualise bookings from Resend: group by (email, date), then create or update booking
        const groupKey = (email: string, date: string) => `${email}\t${date}`;
        const groups = new Map<string, { email: string; date: string; entries: Array<{ id: string; sentAt: string }> }>();
        for (const r of resendItems) {
          const date = r.sentAt.slice(0, 10);
          const key = groupKey(r.email, date);
          if (!groups.has(key)) groups.set(key, { email: r.email, date, entries: [] });
          const g = groups.get(key)!;
          if (!g.entries.some((e) => e.id === r.resendId)) g.entries.push({ id: r.resendId, sentAt: r.sentAt });
        }
        let bookingRows: Array<{ id: string; email: string; date: string; sent_emails?: unknown }> = [];
        let bFrom = 0;
        while (true) {
          const { data: bPage, error: bookFetchErr } = await supabase
            .from(BOOKINGS_TABLE)
            .select("id, email, date, sent_emails")
            .range(bFrom, bFrom + CLIENT_PAGE - 1);
          if (bookFetchErr) throw bookFetchErr;
          const list = (bPage ?? []) as Array<{ id: string; email: string; date: string; sent_emails?: unknown }>;
          bookingRows = bookingRows.concat(list);
          if (list.length < CLIENT_PAGE) break;
          bFrom += CLIENT_PAGE;
        }
        const bookingByKey = new Map<string, { id: string; email: string; date: string; sent_emails: Array<{ id: string; type: string; sentAt: string }> }>();
        for (const row of bookingRows) {
          const r = row as { id: string; email: string; date: string; sent_emails?: unknown };
          const email = String(r.email ?? "").toLowerCase();
          const date = String(r.date ?? "").slice(0, 10);
          if (!email || !date) continue;
          const key = groupKey(email, date);
          const prev = (r.sent_emails as Array<{ id: string; type?: string; sentAt?: string }> | null) ?? [];
          bookingByKey.set(key, {
            id: r.id,
            email,
            date,
            sent_emails: prev.map((e) => ({ id: e.id, type: e.type ?? "resend", sentAt: e.sentAt ?? "" })),
          });
        }
        let bookingsCreated = 0;
        let bookingsUpdated = 0;
        const now = new Date().toISOString();
        for (const [, g] of groups) {
          const key = groupKey(g.email, g.date);
          const existing = bookingByKey.get(key);
          const newEntries = g.entries.map((e) => ({ id: e.id, type: "resend" as const, sentAt: e.sentAt }));
          if (existing) {
            const existingIds = new Set(existing.sent_emails.map((x) => x.id));
            const toAdd = newEntries.filter((e) => !existingIds.has(e.id));
            if (toAdd.length === 0) continue;
            const nextSent = [...existing.sent_emails, ...toAdd];
            const { error: upErr } = await supabase
              .from(BOOKINGS_TABLE)
              .update({ sent_emails: nextSent, updated_at: now })
              .eq("id", existing.id);
            if (upErr) throw upErr;
            bookingsUpdated++;
          } else {
            const timePart = g.entries[0]?.sentAt?.match?.(/T(\d{2}:\d{2})/);
            const time = timePart ? timePart[1] : "—";
            const { error: insErr } = await supabase.from(BOOKINGS_TABLE).insert({
              name: g.email,
              email: g.email,
              phone: "",
              date: g.date,
              time,
              party_size: 1,
              special_requests: null,
              status: "from_resend",
              sent_emails: newEntries,
              updated_at: now,
            });
            if (insErr) throw insErr;
            bookingsCreated++;
          }
        }
        res.status(200).json({
          ok: true,
          imported,
          skipped: allEmails.size - imported,
          total: allEmails.size,
          bookingsCreated,
          bookingsUpdated,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[clients] syncFromResend error:", err);
        res.status(500).json({ error: "Failed to sync from Resend", details: message });
      }
      return;
    }

    // Sync all reservation contacts into clients (by email, source "booking"). Fetch all bookings (paginate past 1000).
    if (o.syncFromBookings === true) {
      try {
        const supabase = getSupabase();
        let rows: Array<{ name: string; email: string; phone?: string }> = [];
        let rFrom = 0;
        const SYNC_PAGE = 1000;
        while (true) {
          const { data: page, error: fetchErr } = await supabase
            .from(BOOKINGS_TABLE)
            .select("name, email, phone")
            .range(rFrom, rFrom + SYNC_PAGE - 1);
          if (fetchErr) throw fetchErr;
          const list = (page ?? []) as Array<{ name: string; email: string; phone?: string }>;
          rows = rows.concat(list);
          if (list.length < SYNC_PAGE) break;
          rFrom += SYNC_PAGE;
        }
        const byEmail = new Map<string, { name: string; email: string; phone: string | null }>();
        for (const r of rows) {
          const email = String((r as { email: string }).email ?? "").trim().toLowerCase();
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
          const name = String((r as { name: string }).name ?? email).trim().slice(0, 200);
          const phone = (r as { phone?: string }).phone != null && String((r as { phone: string }).phone).trim()
            ? String((r as { phone: string }).phone).trim().slice(0, 50)
            : null;
          if (!byEmail.has(email)) byEmail.set(email, { name, email, phone });
        }
        const toUpsert = Array.from(byEmail.values()).map((c) => ({
          ...c,
          source: "booking",
          updated_at: new Date().toISOString(),
        }));
        let synced = 0;
        const BATCH = 200;
        for (let i = 0; i < toUpsert.length; i += BATCH) {
          const batch = toUpsert.slice(i, i + BATCH);
          const { error: upsertErr } = await supabase.from(CLIENTS_TABLE).upsert(batch, { onConflict: "email" });
          if (upsertErr) throw upsertErr;
          synced += batch.length;
        }
        res.status(200).json({ ok: true, synced, total: toUpsert.length });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[clients] syncFromBookings error:", err);
        res.status(500).json({ error: "Failed to sync reservations to clients", details: message });
      }
      return;
    }

    const o2 = o as {
      clients?: Array<{ name: string; email: string; phone?: string | null }>;
      name?: string;
      email?: string;
      phone?: string | null;
    };
    // Single client add: { name, email, phone }
    const single = o2.name != null && o2.email != null && !Array.isArray(o2.clients);
    const list = single
      ? [{ name: String(o2.name), email: String(o2.email), phone: o2.phone ?? null }]
      : Array.isArray(o2.clients)
        ? o2.clients
        : [];
    if (list.length === 0) {
      res.status(400).json({ error: "No clients to import" });
      return;
    }
    const normalized = list
      .filter((c) => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c.email).trim()))
      .map((c) => ({
        name: String(c.name || c.email).trim().slice(0, 200) || c.email,
        email: String(c.email).trim().toLowerCase(),
        phone: c.phone != null && String(c.phone).trim() ? String(c.phone).trim().slice(0, 50) : null,
        source: single ? "manual" : "csv_import",
      }));
    if (normalized.length === 0) {
      res.status(400).json({ error: "Invalid email" });
      return;
    }
    try {
      const supabase = getSupabase();
      if (single) {
        const row = { ...normalized[0], updated_at: new Date().toISOString() };
        const { error } = await supabase.from(CLIENTS_TABLE).upsert(row, { onConflict: "email" });
        if (error) throw error;
        res.status(200).json({ ok: true, imported: 1, skipped: 0, total: 1 });
        return;
      }
      // CSV import: prioritize existing clients — only insert new emails, never overwrite. Fetch all existing (paginate past 1000).
      const seen = new Set<string>();
      const toUpsert = normalized.filter((c) => {
        if (seen.has(c.email)) return false;
        seen.add(c.email);
        return true;
      });
      let existingRows: Array<{ email: string }> = [];
      let erFrom = 0;
      const IMPORT_PAGE = 1000;
      while (true) {
        const { data: page, error: fetchErr } = await supabase
          .from(CLIENTS_TABLE)
          .select("email")
          .range(erFrom, erFrom + IMPORT_PAGE - 1);
        if (fetchErr) throw fetchErr;
        const list = (page ?? []) as Array<{ email: string }>;
        existingRows = existingRows.concat(list);
        if (list.length < IMPORT_PAGE) break;
        erFrom += IMPORT_PAGE;
      }
      const existingEmails = new Set(existingRows.map((r) => r.email?.toLowerCase?.() ?? ""));
      const toInsert = toUpsert.filter((c) => !existingEmails.has(c.email));
      const BATCH = 100;
      let imported = 0;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH).map((c) => ({ ...c, updated_at: new Date().toISOString() }));
        const { error } = await supabase.from(CLIENTS_TABLE).insert(batch);
        if (error) throw error;
        imported += batch.length;
      }
      const skipped = toUpsert.length - imported;
      res.status(200).json({ ok: true, imported, skipped, total: toUpsert.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[clients] POST import error:", err);
      res.status(500).json({ error: "Failed to import clients", details: message });
    }
    return;
  }

  if (req.method === "DELETE") {
    if (!(await requireAuth(req, res))) return;
    let body: unknown;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    } catch {
      res.status(400).json({ error: "Invalid JSON" });
      return;
    }
    const o = body as { id?: string };
    const id = typeof o?.id === "string" ? o.id.trim() : "";
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from(CLIENTS_TABLE).delete().eq("id", id);
      if (error) throw error;
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[clients] DELETE error:", err);
      res.status(500).json({ error: "Failed to delete client" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
