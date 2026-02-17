/**
 * Add one pending reservation to the admin dashboard (Supabase).
 * Run from project root: node scripts/add-pending-booking-miguel.mjs
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const booking = {
  name: "Miguel Andrade Neto",
  email: "otorhinus@gmail.com",
  phone: "+55 71 99981 0802",
  date: "2026-02-16",
  time: "20:30",
  party_size: 11,
  special_requests: "Duración 2 h. Fuente: Online. Fecha de creación: 14 janv. 2026, 01:16",
  status: "pending",
  sent_emails: [],
};

async function addBooking() {
  console.log("Adding pending booking: Miguel Andrade Neto – 16 feb 2026, 20:30, 11 personas...");

  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select("id, name, date, time, party_size, status")
    .single();

  if (error) {
    console.error("Error adding booking:", error.message);
    process.exit(1);
  }

  console.log("✓ Booking added to admin dashboard.");
  console.log("  ID:", data.id);
  console.log("  Name:", data.name);
  console.log("  Date:", data.date, "at", data.time);
  console.log("  Party size:", data.party_size);
  console.log("  Status:", data.status);
  console.log("\nRefresh the admin dashboard to see it (Richieste or pending).");
}

addBooking().catch(console.error);
