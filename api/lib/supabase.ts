import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const BOOKINGS_TABLE = "bookings";

export type BookingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  special_requests: string | null;
  status: string;
  created_at?: string;
};
