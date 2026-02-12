/**
 * Import bookings from Wix
 * Usage: node scripts/import-wix-bookings.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Wix bookings to import
const wixBookings = [
  {
    name: "Stig Rune Pedersen",
    email: "stig.pedersen@dsb.no",
    phone: "+47 97 70 73 96",
    date: "2026-03-12",
    time: "19:45",
    partySize: 18,
    specialRequests: null,
  },
  {
    name: "Axel Gyger",
    email: "axelgyger@gmail.com",
    phone: "+41 79 434 67 08",
    date: "2026-02-14",
    time: "20:15",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "Mae Oliveira",
    email: "lukasmoi20011205@gmail.com",
    phone: "+41 79 884 93 89",
    date: "2026-02-14",
    time: "20:15",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "Naomi Rufli-Prudhomme",
    email: "naomiprudli@hotmail.com",
    phone: "+41 76 367 51 67",
    date: "2026-02-14",
    time: "20:15",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "bryan caloua",
    email: "bryan.caloua@outlook.fr",
    phone: "+33 7 52 67 84 40",
    date: "2026-02-14",
    time: "20:00",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "José Vitor Martins",
    email: "ribeirovitor75@hotmail.com",
    phone: "+41 78 875 32 29",
    date: "2026-02-14",
    time: "20:00",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "Filipe Cardoso",
    email: "pinto.cardoso.filipe@gmail.com",
    phone: "+41 78 815 82 89",
    date: "2026-02-14",
    time: "20:00",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "Felix Pacaud",
    email: "felix.pacaud@gmail.com",
    phone: "+41 76 393 52 06",
    date: "2026-02-14",
    time: "19:45",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "maissa Naoual",
    email: "na.maissa@gmail.com",
    phone: "+33 6 37 98 27 13",
    date: "2026-02-14",
    time: "19:45",
    partySize: 2,
    specialRequests: null,
  },
  {
    name: "Arnaud Chenal",
    email: "arnaud_chenal_suisse@hotmail.com",
    phone: "+41 79 520 30 74",
    date: "2026-02-14",
    time: "19:30",
    partySize: 4,
    specialRequests: null,
  },
  {
    name: "Carlo Alberto Albonetti",
    email: "carloalbertoalbonetti@gmail.com",
    phone: "+41 78 337 49 30",
    date: "2026-02-14",
    time: "18:45",
    partySize: 2,
    specialRequests: null,
  },
];

async function importBookings() {
  console.log(`Importing ${wixBookings.length} bookings from Wix...`);

  // First, add all clients
  const clients = wixBookings.map(b => ({
    name: b.name,
    email: b.email,
    phone: b.phone,
    source: "wix_import",
  }));

  console.log("Adding clients...");
  const { error: clientsError } = await supabase
    .from("clients")
    .upsert(clients, { onConflict: "email" });

  if (clientsError) {
    console.error("Error adding clients:", clientsError);
    process.exit(1);
  }
  console.log("✓ Clients added/updated");

  // Then add bookings with status "request" (waiting for confirmation)
  const bookings = wixBookings.map(b => ({
    name: b.name,
    email: b.email,
    phone: b.phone,
    date: b.date,
    time: b.time,
    party_size: b.partySize,
    special_requests: b.specialRequests,
    status: "request", // Waiting for admin confirmation
    sent_emails: [],
  }));

  console.log("Adding bookings with status 'request'...");
  const { data, error: bookingsError } = await supabase
    .from("bookings")
    .insert(bookings)
    .select();

  if (bookingsError) {
    console.error("Error adding bookings:", bookingsError);
    process.exit(1);
  }

  console.log(`✓ Successfully imported ${data.length} bookings`);
  console.log("\nBookings added:");
  data.forEach(b => {
    console.log(`  - ${b.name} (${b.email}) - ${b.date} at ${b.time} - ${b.party_size} persons - Status: ${b.status}`);
  });

  console.log("\n✓ Done! These bookings are now in 'Richieste' (Requests) tab.");
  console.log("When you accept them in the admin dashboard, confirmation emails will be sent automatically.");
}

importBookings().catch(console.error);
