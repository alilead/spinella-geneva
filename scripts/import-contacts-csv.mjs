/**
 * Import contacts from CSV into Supabase clients table.
 * From project root (after: pnpm install or npm install):
 *   node scripts/import-contacts-csv.mjs "C:\path\to\contacts.csv"
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (or environment).
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add to .env or set in environment.");
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-contacts-csv.mjs <path-to-contacts.csv>");
  process.exit(1);
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else if (!inQuotes && (c === "\n" || c === "\r")) {
      break;
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function cleanPhone(s) {
  if (!s) return null;
  return String(s)
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50) || null;
}

function cleanEmail(s) {
  if (!s) return null;
  const e = String(s).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

const supabase = createClient(url, key);
const raw = readFileSync(csvPath, "utf-8");
const lines = raw.split(/\r?\n/).filter((l) => l.trim());
const headers = parseCSVLine(lines[0]);

const prenomIdx = headers.findIndex((h) => /prénom/i.test(h));
const nomIdx = headers.findIndex((h) => /nom de famille/i.test(h));
const emailIdx = headers.findIndex((h) => /e-mail 1/i.test(h) || /e-mail/i.test(h));
const phoneIdx = headers.findIndex((h) => /téléphone 1/i.test(h) || /téléphone/i.test(h));

if (emailIdx < 0) {
  console.error("CSV must have an email column (e.g. 'E-mail 1')");
  process.exit(1);
}

const clients = [];
for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  const email = cleanEmail(cols[emailIdx] || cols[2]);
  if (!email) continue;
  const prenom = (cols[prenomIdx] ?? "").trim();
  const nom = (cols[nomIdx] ?? "").trim();
  const name = [prenom, nom].filter(Boolean).join(" ") || email;
  const phone = cleanPhone(cols[phoneIdx] ?? cols[3]);
  clients.push({ name: name.slice(0, 200), email, phone });
}

// Deduplicate by email (last occurrence wins) so upsert batches never have duplicate emails
const byEmail = new Map();
for (const c of clients) byEmail.set(c.email, c);
const unique = [...byEmail.values()];
console.log(`Parsed ${clients.length} valid contacts, ${unique.length} unique by email`);

const BATCH = 200;
let total = 0;
for (let i = 0; i < unique.length; i += BATCH) {
  const batch = unique.slice(i, i + BATCH);
  const { error } = await supabase.from("clients").upsert(batch, { onConflict: "email" });
  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    process.exit(1);
  }
  total += batch.length;
  console.log(`Imported ${total}/${unique.length}`);
}

console.log(`Done. Imported ${total} clients into the database.`);
