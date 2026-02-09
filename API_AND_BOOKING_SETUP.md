# Why Reservations “Don’t Work” & How to Fix It

## What’s going on

When you deploy only the **front end** (e.g. Netlify or Vercel with “static” build):

- The site you see is just the React app (HTML/JS/CSS).
- There is **no Node server running**.
- The “Book a table” form sends a request to **`/api/trpc`** on the same domain.
- On a static deploy, **`/api/trpc` doesn’t exist** → the host returns the SPA (index.html), so the app gets HTML instead of JSON → **“Unexpected token '<' … is not valid JSON”** and the reservation never reaches the backend.

So: **Resend and the booking API are correctly set up in code**, but they only run when the **Node server** is running. Right now only the static site is deployed, so the API (and thus Resend) is never used.

---

## What has to be running for reservations to work

1. **Node API server**  
   - Serves the tRPC endpoint at `/api/trpc`.  
   - Handles `bookings.create` (saves to DB and sends the Resend email).

2. **Environment variables on the server**
   - **`DATABASE_URL`** – MySQL connection string (e.g. `mysql://user:password@host:3306/spinella`).  
     Without this, the server will respond with “Database not available” when someone tries to book.
   - **`RESEND_API_KEY`** – From [Resend](https://resend.com).  
     Without this, the booking can be saved but the confirmation email will not be sent (and the server logs a warning).

3. **Resend setup**
   - Create an API key in the Resend dashboard and set it as `RESEND_API_KEY`.
   - In Resend, add and verify the **domain** you send from (e.g. `spinella-geneva.ch` or `spinella.ch`).
   - The code currently sends from: **`Spinella Geneva <reservations@spinella-geneva.ch>`**.  
     If your domain is different, change the `from` address in `server/_core/email.ts` to match a verified sender in Resend.

---

## 1. Test the API locally

This confirms that the server, DB, and Resend are correctly configured.

```bash
# Install dependencies
pnpm install

# Create .env (copy from .env.example) and set at least:
#   DATABASE_URL=mysql://...
#   RESEND_API_KEY=re_...

# Run the full app (server + client in dev)
pnpm run dev
```

Then open the app (e.g. http://localhost:3000), go to the booking page, and submit a reservation.

- If the **API is running and DB + Resend are set**: the request succeeds and the guest receives the Resend confirmation email.
- If you see **“Unexpected token '<'”** in the browser: the request is not hitting the Node server (e.g. you’re opening the built static files without running the server).

To test the API in production mode locally:

```bash
pnpm run build
pnpm run start
```

Then use the same URL (e.g. http://localhost:3000) and submit a booking again.

---

## 2. Deploy the API so it runs in production

You have two main options.

### A. Deploy the existing Node server (recommended)

Deploy the **same Express server** that already has tRPC and Resend wired up. Good options:

- **Railway** – Connect the repo, set `DATABASE_URL` and `RESEND_API_KEY`, and use `pnpm run build && pnpm run start` (or run the built server as in the `start` script).
- **Render** – Same idea: build and start the Node server, add a MySQL DB and env vars.
- **Fly.io** – Similar: run the built server, attach a MySQL or use a managed DB.

Important:

- Set **`DATABASE_URL`** and **`RESEND_API_KEY`** (and any other env vars from `.env.example`) in the host’s environment.
- The booking API will be at **`https://your-api-host/api/trpc`**.

If the API is on a **different domain** than the front end (e.g. API on Railway, site on Vercel):

- Configure CORS on the Express server so the front-end origin is allowed.
- In the **client**, point tRPC at the API URL (e.g. with an env var like `VITE_API_URL=https://your-api-host`) and use that in `main.tsx` for `httpBatchLink({ url: ... })` instead of `"/api/trpc"`.

### B. Keep only the static site (no API)

If you don’t deploy the Node server:

- Reservations will **not** hit the API and **will not** use Resend or the database.
- The app already shows a fallback: “Send request by email” (mailto) when the request fails, so guests can still send their details by email and you can confirm manually.

So: **Resend and the API are set up correctly in the repo**; they just don’t run until the Node server is deployed and env vars (including `RESEND_API_KEY`) are set on that server.

---

## Quick checklist

| Item | Status |
|------|--------|
| Resend code in `server/_core/email.ts` | ✅ Implemented |
| Resend “from” address / domain | ⚠️ Set and verify in Resend dashboard |
| `RESEND_API_KEY` in server env | ⚠️ Set where the Node server runs |
| Node server deployed (e.g. Railway, Render) | ❌ Currently only static site is deployed |
| `DATABASE_URL` on server | ⚠️ Required for saving bookings |
| Client calling `/api/trpc` | ✅ Relative URL; works when API is on same host |

Once the **API is deployed** and **`DATABASE_URL`** and **`RESEND_API_KEY`** are set there, submitting a reservation from the site will hit the API, save the booking, and send the confirmation email via Resend.
