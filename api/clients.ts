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
};

function rowToClient(r: ClientRow): ClientDoc {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? null,
    source: r.source ?? "booking",
    createdAt: r.created_at,
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
      const { data: rows, error } = await supabase
        .from(CLIENTS_TABLE)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const clients = (rows ?? []).map((r: ClientRow) => rowToClient(r));
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
    };

    // Sync all reservation contacts into clients (by email, source "booking").
    if (o.syncFromBookings === true) {
      try {
        const supabase = getSupabase();
        const { data: rows, error: fetchErr } = await supabase
          .from(BOOKINGS_TABLE)
          .select("name, email, phone");
        if (fetchErr) throw fetchErr;
        const byEmail = new Map<string, { name: string; email: string; phone: string | null }>();
        for (const r of rows ?? []) {
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
        console.error("[clients] syncFromBookings error:", err);
        res.status(500).json({ error: "Failed to sync reservations to clients" });
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
    const BATCH = 200;
    const toUpsert = list
      .filter((c) => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c.email).trim()))
      .map((c) => ({
        name: String(c.name || c.email).trim().slice(0, 200) || c.email,
        email: String(c.email).trim().toLowerCase(),
        phone: c.phone != null && String(c.phone).trim() ? String(c.phone).trim().slice(0, 50) : null,
        source: single ? "manual" : "csv_import",
      }));
    if (toUpsert.length === 0) {
      res.status(400).json({ error: "Invalid email" });
      return;
    }
    try {
      const supabase = getSupabase();
      let imported = 0;
      for (let i = 0; i < toUpsert.length; i += BATCH) {
        const batch = toUpsert.slice(i, i + BATCH);
        const { error } = await supabase.from(CLIENTS_TABLE).upsert(
          batch.map((c) => ({ ...c, updated_at: new Date().toISOString() })),
          { onConflict: "email" }
        );
        if (error) throw error;
        imported += batch.length;
      }
      res.status(200).json({ ok: true, imported, total: toUpsert.length });
    } catch (err) {
      console.error("[clients] POST import error:", err);
      res.status(500).json({ error: "Failed to import clients" });
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
