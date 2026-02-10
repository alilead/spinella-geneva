# Booking (Vercel serverless + Resend + Supabase)

When someone submits the form, a **Vercel serverless function** (`/api/booking`) sends two emails via Resend and, if Supabase is configured, saves the booking to **Supabase** (status `pending` or `request` for 8+ guests). The **admin page** (`/admin`) lets you view, accept, and import reservations.

1. **Confirmation to the client** – the guest receives the booking details.
2. **Copy to you** – the address in `RESTAURANT_EMAIL` (and BCC `info@spinella.ch`) receives the same details.
3. **Supabase** – each booking is stored in the `bookings` table (when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set). See **SUPABASE_SETUP.md** for setup.

---

## Setup

The booking form POSTs to **`/api/booking`**, which is a **Vercel serverless function** in this repo (`api/booking.ts`). It only uses Resend.

1. Deploy the site to **Vercel** (connect the repo; Vercel runs `pnpm run build:client` and serves the static site + the `api/` functions).
2. In **Vercel** → your project → **Settings** → **Environment Variables**, add:
   - **`RESEND_API_KEY`** – your Resend API key ([resend.com/api-keys](https://resend.com/api-keys)).
   - **`RESTAURANT_EMAIL`** – e.g. `info@spinella.ch` (where you receive each booking).
   - **`SUPABASE_URL`**, **`SUPABASE_ANON_KEY`**, **`SUPABASE_SERVICE_ROLE_KEY`**, **`VITE_SUPABASE_URL`**, **`VITE_SUPABASE_ANON_KEY`** – from your Supabase project (bookings + admin login). See **SUPABASE_SETUP.md**. Optionally **`ADMIN_EMAIL`** to restrict admin to one email.
3. In Resend, add and verify your sending domain (e.g. spinella.ch). Emails are sent from `info@spinella.ch`; the domain must match.
4. Redeploy. Booking will work on **spinella.ch** (or your Vercel URL).

**Admin page** (`/admin`): log in with the **Supabase Auth** user you created (e.g. `admin@spinella.ch` / **`spinellaadmin*1`**). You can view all reservations, **Accept** pending/request-only bookings, and **Import JSON** to load old bookings. See **SUPABASE_SETUP.md** for creating the admin user.

---

## Troubleshooting: 404 and “is not valid JSON”

If you see **404** on `/api/booking` or **"Unexpected token 'T', \"The page c\"... is not valid JSON"**, the request is hitting a page that returns HTML instead of JSON.

**Check:**

1. **Deploy** – The `api/` folder must be part of the Vercel project. Ensure `api/booking.ts` is in the repo and that the latest commit is deployed.
2. **Environment variables** – In Vercel → Settings → Environment Variables, confirm `RESEND_API_KEY` (and optionally `RESTAURANT_EMAIL`) are set for Production (and Preview if you use it).
3. **Redeploy** – After changing env vars or `api/booking.ts`, trigger a new deployment.

The client calls **`/api/booking`** (same origin). There is no separate API host or `VITE_API_URL` for booking.

---

This project uses **Supabase** for storing bookings when configured; see **SUPABASE_SETUP.md** for setup. For “booking only” without a database, Resend + inbox is enough (emails still work).
