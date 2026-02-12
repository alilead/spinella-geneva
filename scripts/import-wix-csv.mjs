/**
 * Import reservations from Wix CSV export
 * Usage: node scripts/import-wix-csv.mjs "path/to/csv"
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

/**
 * Simple CSV parser (handles quoted fields)
 */
function parseCSV(content) {
  const lines = content.split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple split by comma (assumes no commas in data or they're quoted)
    const values = [];
    let current = "";
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || "";
    });
    records.push(record);
  }
  
  return records;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/import-wix-csv.mjs "C:\\path\\to\\file.csv"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Parse Wix datetime format "9 janv. 2025, 13:13:06" to "YYYY-MM-DD"
 */
function parseWixDate(wixDateStr) {
  if (!wixDateStr) return null;
  
  const months = {
    janv: "01", févr: "02", mars: "03", avr: "04", mai: "05", juin: "06",
    juil: "07", août: "08", sept: "09", oct: "10", nov: "11", déc: "12"
  };
  
  // Format: "9 janv. 2025, 13:13:06"
  const match = wixDateStr.match(/(\d+)\s+(\w+)\.\s+(\d{4}),\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  
  const [, day, monthFr, year, hour, minute] = match;
  const month = months[monthFr.toLowerCase()];
  if (!month) return null;
  
  return {
    date: `${year}-${month}-${day.padStart(2, "0")}`,
    time: `${hour}:${minute}`,
  };
}

/**
 * Map Wix status to our status
 */
function mapStatus(wixStatus) {
  if (wixStatus === "RESERVADA") return "confirmed";
  if (wixStatus === "CANCELADA") return "cancelled";
  return "request"; // Default to request for unknown statuses
}

async function importCsv() {
  console.log(`Reading CSV from: ${csvPath}`);
  
  const content = readFileSync(csvPath, "utf-8");
  const records = parseCSV(content);
  
  console.log(`Found ${records.length} records in CSV`);
  
  const bookingsToImport = [];
  const clientsToImport = [];
  
  for (const record of records) {
    const parsed = parseWixDate(record["Horario"]);
    if (!parsed) {
      console.warn(`Skipping invalid date: ${record["Horario"]}`);
      continue;
    }
    
    const name = record["Nombre"]?.trim();
    const email = record["Email"]?.trim().toLowerCase();
    const phone = record["Número de teléfono"]?.trim();
    const partySize = parseInt(record["Cantidad"]) || 1;
    const specialRequests = record["SPECIAL REQUEST/DEMANDE SPECIAL"]?.trim() || null;
    const status = mapStatus(record["Estado"]);
    
    if (!name || !email) {
      console.warn(`Skipping record with missing name or email`);
      continue;
    }
    
    // Check if date is Sunday (closed)
    const dateObj = new Date(parsed.date);
    if (dateObj.getDay() === 0) {
      console.warn(`Skipping Sunday booking: ${name} on ${parsed.date}`);
      continue;
    }
    
    clientsToImport.push({
      name,
      email,
      phone,
      source: "wix_csv",
    });
    
    bookingsToImport.push({
      name,
      email,
      phone,
      date: parsed.date,
      time: parsed.time,
      party_size: partySize,
      special_requests: specialRequests,
      status,
      sent_emails: [],
    });
  }
  
  console.log(`\nValid bookings to import: ${bookingsToImport.length}`);
  
  // Remove duplicates by email
  const uniqueClients = Array.from(
    new Map(clientsToImport.map(c => [c.email, c])).values()
  );
  
  console.log(`\nImporting ${uniqueClients.length} unique clients...`);
  const { error: clientsError } = await supabase
    .from("clients")
    .upsert(uniqueClients, { onConflict: "email" });
  
  if (clientsError) {
    console.error("Error importing clients:", clientsError);
    process.exit(1);
  }
  console.log("✓ Clients imported");
  
  // Import bookings in batches
  console.log(`\nImporting ${bookingsToImport.length} bookings...`);
  const BATCH_SIZE = 200;
  let imported = 0;
  
  for (let i = 0; i < bookingsToImport.length; i += BATCH_SIZE) {
    const batch = bookingsToImport.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("bookings")
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`Error importing batch ${i / BATCH_SIZE + 1}:`, error);
      continue;
    }
    
    imported += data.length;
    console.log(`  Batch ${i / BATCH_SIZE + 1}: ${data.length} bookings imported`);
  }
  
  console.log(`\n✓ Successfully imported ${imported} bookings`);
  console.log(`\nSummary:`);
  console.log(`  - Total records in CSV: ${records.length}`);
  console.log(`  - Valid bookings: ${bookingsToImport.length}`);
  console.log(`  - Successfully imported: ${imported}`);
  console.log(`  - Unique clients: ${uniqueClients.length}`);
}

importCsv().catch(console.error);
