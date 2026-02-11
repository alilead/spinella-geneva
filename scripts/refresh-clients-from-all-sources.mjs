/**
 * Refresh clients from all sources: reservations (bookings) + Resend sent emails.
 * Run from project root (after: pnpm install or npm install):
 *   node scripts/refresh-clients-from-all-sources.mjs
 * Requires .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY (optional for Resend step).
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const CLIENTS_TABLE = "clients";
const BOOKINGS_TABLE = "bookings";
const PAGE = 1000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function syncFromBookings() {
  console.log("1) Syncing reservations to clients...");
  let rows = [];
  let from = 0;
  while (true) {
    const { data: page, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select("name, email, phone")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const list = page ?? [];
    rows = rows.concat(list);
    if (list.length < PAGE) break;
    from += PAGE;
  }
  const byEmail = new Map();
  for (const r of rows) {
    const email = String(r.email ?? "").trim().toLowerCase();
    if (!email || !emailRegex.test(email)) continue;
    const name = String(r.name ?? email).trim().slice(0, 200);
    const phone = r.phone != null && String(r.phone).trim() ? String(r.phone).trim().slice(0, 50) : null;
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
    const { error } = await supabase.from(CLIENTS_TABLE).upsert(batch, { onConflict: "email" });
    if (error) throw error;
    synced += batch.length;
  }
  console.log(`   Synced ${synced} clients from reservations.`);
  return synced;
}

async function fetchResendEmailsList(resendKey, after) {
  const url = new URL("https://api.resend.com/emails");
  url.searchParams.set("limit", "100");
  if (after) url.searchParams.set("after", after);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Resend API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function syncFromResend() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("2) Skipping Resend (RESEND_API_KEY not set).");
    return { imported: 0, skipped: 0, bookingsCreated: 0, bookingsUpdated: 0 };
  }
  console.log("2) Syncing from Resend (clients + bookings)...");
  let allEmails = new Set();
  let resendItems = [];
  let after;
  try {
  do {
    const list = await fetchResendEmailsList(resendKey, after);
    const err = list?.error;
    if (err) throw err;
    const body = list?.data ?? list;
    const items = body?.data ?? [];
    for (const item of items) {
      const sentAt = item.created_at ?? new Date().toISOString();
      for (const addr of item.to ?? []) {
        const e = typeof addr === "string" ? addr : addr?.email;
        const normalized = String(e ?? "").trim().toLowerCase();
        if (normalized && emailRegex.test(normalized)) {
          allEmails.add(normalized);
          resendItems.push({ email: normalized, resendId: item.id, sentAt });
        }
      }
    }
    after = items.length > 0 ? items[items.length - 1].id : undefined;
    if (!body?.has_more) break;
  } while (after);
  } catch (err) {
    console.warn("   Resend sync failed (check RESEND_API_KEY):", err.message);
    return { imported: 0, skipped: 0, bookingsCreated: 0, bookingsUpdated: 0 };
  }

  let existingClientEmails = [];
  let ecFrom = 0;
  while (true) {
    const { data: page, error } = await supabase.from(CLIENTS_TABLE).select("email").range(ecFrom, ecFrom + PAGE - 1);
    if (error) throw error;
    const list = page ?? [];
    existingClientEmails = existingClientEmails.concat(list);
    if (list.length < PAGE) break;
    ecFrom += PAGE;
  }
  const existingEmails = new Set(existingClientEmails.map((r) => r.email?.toLowerCase?.() ?? ""));
  const toInsert = Array.from(allEmails).filter((e) => !existingEmails.has(e));
  let imported = 0;
  const BATCH = 100;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH).map((email) => ({
      name: email,
      email,
      phone: null,
      source: "resend",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from(CLIENTS_TABLE).insert(batch);
    if (error) throw error;
    imported += batch.length;
  }
  console.log(`   Clients: ${imported} added from Resend, ${allEmails.size - imported} already in list.`);

  const groupKey = (email, date) => `${email}\t${date}`;
  const groups = new Map();
  for (const r of resendItems) {
    const date = r.sentAt.slice(0, 10);
    const key = groupKey(r.email, date);
    if (!groups.has(key)) groups.set(key, { email: r.email, date, entries: [] });
    const g = groups.get(key);
    if (!g.entries.some((e) => e.id === r.resendId)) g.entries.push({ id: r.resendId, sentAt: r.sentAt });
  }
  let bookingRows = [];
  let bFrom = 0;
  while (true) {
    const { data: bPage, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select("id, email, date, sent_emails")
      .range(bFrom, bFrom + PAGE - 1);
    if (error) throw error;
    const list = bPage ?? [];
    bookingRows = bookingRows.concat(list);
    if (list.length < PAGE) break;
    bFrom += PAGE;
  }
  const bookingByKey = new Map();
  for (const row of bookingRows) {
    const email = String(row.email ?? "").toLowerCase();
    const date = String(row.date ?? "").slice(0, 10);
    if (!email || !date) continue;
    const key = groupKey(email, date);
    const prev = row.sent_emails ?? [];
    bookingByKey.set(key, {
      id: row.id,
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
    const newEntries = g.entries.map((e) => ({ id: e.id, type: "resend", sentAt: e.sentAt }));
    if (existing) {
      const existingIds = new Set(existing.sent_emails.map((x) => x.id));
      const toAdd = newEntries.filter((e) => !existingIds.has(e.id));
      if (toAdd.length === 0) continue;
      const nextSent = [...existing.sent_emails, ...toAdd];
      const { error } = await supabase
        .from(BOOKINGS_TABLE)
        .update({ sent_emails: nextSent, updated_at: now })
        .eq("id", existing.id);
      if (error) throw error;
      bookingsUpdated++;
    } else {
      const timePart = g.entries[0]?.sentAt?.match?.(/T(\d{2}:\d{2})/);
      const time = timePart ? timePart[1] : "—";
      const { error } = await supabase.from(BOOKINGS_TABLE).insert({
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
      if (error) throw error;
      bookingsCreated++;
    }
  }
  console.log(`   Bookings: ${bookingsCreated} created, ${bookingsUpdated} updated from Resend.`);
  return { imported, skipped: allEmails.size - imported, bookingsCreated, bookingsUpdated };
}

async function main() {
  try {
    const fromBookings = await syncFromBookings();
    const fromResend = await syncFromResend();
    console.log("Done. Clients now include: CSV import + reservations + Resend.");
    if (typeof fromResend === "object") {
      console.log(`Resend: ${fromResend.imported} clients added, ${fromResend.bookingsCreated} bookings created, ${fromResend.bookingsUpdated} bookings updated.`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
