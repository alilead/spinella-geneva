# Booking (Vercel serverless + Resend)

Booking uses **only Vercel serverless**: no database, no Node server (Railway, Fly.io, etc.). When someone submits the form, a **Vercel serverless function** (`/api/booking`) sends two emails via Resend and that’s it.

1. **Confirmation to the client** – the guest receives the booking details.
2. **Copy to you** – the address in `RESTAURANT_EMAIL` (and BCC `info@spinella.ch`) receives the same details.

All bookings live in your inbox.

---

## Setup

The booking form POSTs to **`/api/booking`**, which is a **Vercel serverless function** in this repo (`api/booking.ts`). It only uses Resend.

1. Deploy the site to **Vercel** (connect the repo; Vercel runs `pnpm run build:client` and serves the static site + the `api/` functions).
2. In **Vercel** → your project → **Settings** → **Environment Variables**, add:
   - **`RESEND_API_KEY`** – your Resend API key ([resend.com/api-keys](https://resend.com/api-keys)).
   - **`RESTAURANT_EMAIL`** – e.g. `info@spinella.ch` (where you receive each booking).
3. In Resend, add and verify your sending domain (e.g. spinella.ch). Emails are sent from `info@spinella.ch`; the domain must match.
4. Redeploy. Booking will work on **spinella.ch** (or your Vercel URL).

---

## Troubleshooting: 404 and “is not valid JSON”

If you see **404** on `/api/booking` or **"Unexpected token 'T', \"The page c\"... is not valid JSON"**, the request is hitting a page that returns HTML instead of JSON.

**Check:**

1. **Deploy** – The `api/` folder must be part of the Vercel project. Ensure `api/booking.ts` is in the repo and that the latest commit is deployed.
2. **Environment variables** – In Vercel → Settings → Environment Variables, confirm `RESEND_API_KEY` (and optionally `RESTAURANT_EMAIL`) are set for Production (and Preview if you use it).
3. **Redeploy** – After changing env vars or `api/booking.ts`, trigger a new deployment.

The client calls **`/api/booking`** (same origin). There is no separate API host or `VITE_API_URL` for booking.

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

For “booking only”, Resend + inbox is enough.
