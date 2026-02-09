# Booking (Resend only)

Booking is **Resend-only**: no database, no Render, no separate Node server. When someone submits the form, a **Vercel serverless function** sends two emails via Resend and that’s it.

1. **Confirmation to the client** – the guest receives the booking details.
2. **Copy to you** – the address in `RESTAURANT_EMAIL` (and BCC `info@spinella.ch`) receives the same details.

All bookings live in your inbox.

---

## Vercel + Resend only (recommended)

The booking form POSTs to **`/api/booking`**, which is a **Vercel serverless function** in this repo (`api/booking.ts`). It only uses Resend; no database or other backend.

1. Deploy the site to **Vercel** as usual (connect the repo; Vercel will run `pnpm run build:client` and serve the static site + the `api/` functions).
2. In **Vercel** → your project → **Settings** → **Environment Variables**, add:
   - **`RESEND_API_KEY`** – your Resend API key ([resend.com/api-keys](https://resend.com/api-keys)).
   - **`RESTAURANT_EMAIL`** – e.g. `reservations@spinella.ch` or `info@spinella.ch` (where you receive each booking).
3. In Resend, add and verify your sending domain (e.g. spinella.ch). Emails are sent from `reservations@spinella.ch`; the domain must match.
4. Redeploy. Booking will work on **spinella.ch** (or your Vercel URL) with no Render or Node server.

---

## Setup (if you run the full Node app instead)

1. **Resend** – Create an API key at [resend.com/api-keys](https://resend.com/api-keys) and add/verify your sending domain. Set `RESEND_API_KEY` in your `.env`.
2. **Your email** – Set `RESTAURANT_EMAIL` to the address where you want to receive each booking (e.g. `reservations@spinella.ch` or `info@spinella.ch`).
3. **Database** – **Optional.** Leave `DATABASE_URL` empty if you only need booking emails. You only need a database if you use newsletter signups or auth.
4. **Run the server** – `pnpm run build && pnpm run start` (or `pnpm run dev`). The site and API must be served together so `/api/trpc` is available.

## Site on Vercel, API at spinella.ch

1. Deploy the API on the host that serves **spinella.ch**: `pnpm run build && pnpm run start`, with `RESEND_API_KEY` and `RESTAURANT_EMAIL` set (no `DATABASE_URL` needed for booking).
2. On the API server, set **`CORS_ORIGIN`** to your Vercel/site origin.
3. In Vercel, add build env **`VITE_API_URL`** = **`https://www.spinella.ch`**. Redeploy.

---

## Troubleshooting: 404 and “is not valid JSON”

If you see **404** on `api/trpc/bookings.create` and **"Unexpected token 'T', \"The page c\"... is not valid JSON"**, the browser is calling a URL that **does not run the Node API** — the server returns an HTML page (e.g. “The page could not be found”) instead of JSON.

**Common case: spinella.ch is on Vercel**  
Vercel only runs `pnpm run build:client` (static site). There is **no** `/api/trpc` on Vercel, so every booking request gets a 404/HTML response.

**Fix (choose one):**

**Option A – API on the same domain (spinella.ch)**  
1. Deploy the **full app** (Node server + client) on a host that runs Node: **Railway**, **Render**, or **Fly.io**.  
2. Build: `pnpm run build` (this builds both client and server).  
3. Start: `pnpm run start`.  
4. Point your domain **spinella.ch** to that host.  
5. Do **not** set `VITE_API_URL` (the client will use `https://spinella.ch/api/trpc`).  
6. On the server, set `RESEND_API_KEY`, `RESTAURANT_EMAIL`, and if needed `CORS_ORIGIN`.

**Option B – Site on Vercel, API elsewhere**  
1. Deploy **only the API** on Railway/Render: run `pnpm run build && pnpm run start` there, with `RESEND_API_KEY` and `RESTAURANT_EMAIL`.  
2. Note the API URL (e.g. `https://spinella-api.railway.app`).  
3. On that API server, set **`CORS_ORIGIN`** = `https://www.spinella.ch` (or your Vercel URL).  
4. In **Vercel** → your project → **Settings** → **Environment Variables**, add **`VITE_API_URL`** = that API URL (e.g. `https://spinella-api.railway.app`) for **Production** (and Preview if you use it).  
5. **Redeploy** the Vercel project so the new build uses `VITE_API_URL`. The booking form will then call the Railway/Render API instead of spinella.ch, and the 404 will stop.

---

## Optional: free database (if you want to store data later)

If you later want to store bookings, newsletter signups, or auth in a database, here are **free** options:

| Service | Type | Free tier |
|--------|------|-----------|
| [Supabase](https://supabase.com) | PostgreSQL | 500 MB, good for small apps |
| [Neon](https://neon.tech) | PostgreSQL | 0.5 GB, serverless |
| [PlanetScale](https://planetscale.com) | MySQL | 5 GB, then scales to zero |
| [Turso](https://turso.tech) | SQLite (edge) | 9 GB total, 500 DBs |
| [Airtable](https://airtable.com) | Spreadsheet-style API | 1,000 records per base |

This app’s schema is MySQL (Drizzle). For Supabase/Neon you’d switch to PostgreSQL and adjust the schema; PlanetScale stays MySQL. For “booking only”, Resend + inbox is enough.
