# Supabase setup guide

This project uses **Supabase** (PostgreSQL) to store and manage reservations. Bookings are still sent by email (Resend); Supabase is used so the admin page (`/admin`) can list, accept, and import reservations.

---

## What you need

- A **Supabase account** (free at [supabase.com](https://supabase.com))
- Your app deployed on **Vercel** (or another host where you can set environment variables)

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose your **organization**, enter a **project name** (e.g. `spinella-geneva`), set a **database password** (save it somewhere safe), and pick a **region** (e.g. Frankfurt or closest to you).
4. Click **Create new project** and wait until it’s ready (1–2 minutes).

---

## Step 2: Create the `bookings` table

1. In the Supabase dashboard, open your project.
2. Go to **SQL Editor** in the left menu.
3. Click **New query** and paste the following SQL:

```sql
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  date date not null,
  time text not null,
  party_size int not null default 1,
  special_requests text,
  status text not null default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

-- Optional: allow only the service role (your API) to access the table.
-- The app uses the service role key in API routes, so RLS can block anon/authenticated.
alter table public.bookings enable row level security;

create policy "Service role only"
  on public.bookings
  for all
  using (false)
  with check (false);
```

4. Click **Run** (or press Ctrl+Enter). You should see “Success. No rows returned.”

**Note:** The policy above denies all access via the Supabase client when using the **anon** or **authenticated** key. Your Vercel API uses the **service role** key, which bypasses RLS, so the app can still read and write bookings. If you prefer to leave RLS off for simplicity, you can run only the `create table` part and skip the `alter table` and `create policy` lines.

---

## Step 2b: Create the `clients` table

Everyone who books is added as a client. You can also import contacts from a CSV.

1. In the Supabase dashboard, go to **SQL Editor**.
2. Paste and run:

```sql
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  source text not null default 'booking',
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

alter table public.clients enable row level security;
create policy "Service role only" on public.clients for all using (false) with check (false);
```

**If you get "file or directory could not be found" or 500 on /api/clients:**  
Redeploy after the latest push (vercel.json includes `api/_lib` for API routes). In Vercel → Project → Deployments → select the latest → **Functions** tab: open the log for `api/clients` to see the exact error (e.g. missing module vs Supabase).

---

## Step 2c: Add `sent_emails` to `bookings` (optional, for email status in admin)

To see which emails were sent for each reservation and their status (e.g. delivered, opened), add a column to store Resend email IDs:

1. In Supabase → **SQL Editor**, run:

```sql
alter table public.bookings
  add column if not exists sent_emails jsonb default '[]' not null;
```

2. Redeploy or ensure your API uses the latest code. After this, new booking and confirmation/decline emails will be recorded, and in the admin you can open a reservation to see “Emails sent” and status.

---

## Step 3: Create the admin user (Supabase Authentication)

1. In the Supabase dashboard, go to **Authentication** → **Users** in the left menu.
2. Click **Add user** → **Create new user**.
3. Enter an **email** (e.g. `info@spinella.ch`) and set **Password** to **`spinellaadmin*3`** (or your chosen admin password).
4. Click **Create user**.

This user is the only one who can log in to the **Admin** page (`/admin`). Optionally set **ADMIN_EMAIL** in Vercel to this email so the API only accepts that user.

### Admin login credentials

- **Credentials** are the Supabase Auth user you created above. There are no separate credentials stored in the code.
- **Example:** email **`admin@spinella.ch`**, password **`spinellaadmin*1`** (or whatever you set in Step 3).
- **Why the admin page sometimes opens without asking for credentials:** The app uses Supabase Auth, which keeps the session in the browser (localStorage). If you already logged in before, reopening `/admin` restores that session and shows the dashboard directly. To see the login form again, click **Log out** on the admin page.

---

## Step 4: Get your project URL and keys

1. In the Supabase dashboard, go to **Project Settings** (gear icon in the left sidebar).
2. Open the **API** section.
3. You’ll see:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`) → this is **`SUPABASE_URL`**
   - **Project API keys**:
     - **anon public** – do **not** use for the booking API (it’s for browser/client and will be restricted by RLS).
     - **service_role** – use this in your **server only**. It bypasses RLS and must stay secret. → this is **`SUPABASE_SERVICE_ROLE_KEY`**

Copy the **Project URL** and the **service_role** key (click “Reveal” if needed).

---

## Step 5: Add the variables to Vercel

1. In **Vercel** → your project → **Settings** → **Environment Variables**, add:

   | Name | Value | Environment |
   |------|--------|-------------|
   | `SUPABASE_URL` | Your Project URL | Production (and Preview) |
   | `SUPABASE_ANON_KEY` | Your **anon public** key | Production (and Preview) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your **service_role** key | Production (and Preview) |
   | `VITE_SUPABASE_URL` | Same as Project URL | Production (and Preview) |
   | `VITE_SUPABASE_ANON_KEY` | Same as **anon public** key | Production (and Preview) |
   | `ADMIN_EMAIL` | (optional) e.g. `admin@spinella.ch` | Production (and Preview) |

2. Save and **redeploy** the project.

**Important:** Never expose the **service_role** key in the browser. The **anon** key is safe in the client for Authentication.

---

## Step 6: Local development (optional)

To test booking and admin with Supabase on your machine:

1. Create a `.env` file in the project root (and add `.env` to `.gitignore` if it isn’t already).
2. Add the same variables (and for admin login, the VITE_ ones for the client):

   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ADMIN_EMAIL=admin@spinella.ch
   ```

3. Run your dev server. Ensure it loads `.env` for the API.

Never commit `.env` or share the service role key.

---

## Import contacts from CSV (clients table)

**Option A: Via Admin dashboard (easiest)**

1. Log in to `/admin`.
2. Open the **Clients** tab.
3. Click **Import CSV** and select your contacts file.
4. CSV columns expected: `Name` (or `Prénom`, `Nom de famille`), `Email` or `E-mail 1`, `Phone` or `Téléphone 1`.

If you see **"Failed to import clients"**, the message below it now shows the server error (e.g. Supabase constraint or timeout). For very large files (e.g. 6000+ rows), use Option B to avoid timeouts.

**Option B: Via Node script (for large files, e.g. ~6000 contacts)**

There is no `.env` file in the repo (it is git-ignored). Create it and add your Supabase keys:

1. In the project root, create a file named **`.env`** (or copy **`.env.example`** and rename the copy to `.env`).
2. Add these two lines with your real values (from Supabase → **Project Settings** → **API**):
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. From the **project root**, run `pnpm install` or `npm install` so dependencies (e.g. Supabase) are installed.
4. Run the import script (use your actual CSV path; run from project root):
   ```bash
   node scripts/import-contacts-csv.mjs "C:\path\to\contacts.csv"
   ```

**Get the full list from Resend (everyone who received an email)**

To add all recipients of emails you’ve sent via Resend (e.g. booking confirmations) into the clients list:

1. Log in to `/admin`.
2. Open the **Clients** tab — it's the **fourth tab** (icon: people/users), after List, Calendar, and Special requests.
3. At the top of that tab you'll see several buttons. Click **Sync from Resend** (between "Sync reservations to clients" and "Import CSV"). The app will fetch sent emails from Resend and add any new recipients as clients (existing clients are skipped).
4. After it finishes, the message shows how many were added and how many were already in the list.

Run this whenever you want to refresh the client list from Resend. New bookings are already added to clients when they’re created.

---

## What the app stores in Supabase

| Table     | Purpose |
|----------|---------|
| `bookings` | One row per reservation: `name`, `email`, `phone`, `date`, `time`, `party_size`, `special_requests`, `status` (`pending` / `request` / `confirmed` / `cancelled`), `created_at`, `updated_at`. |

- New bookings from the site are written by `/api/booking`.
- The admin page reads and updates them via `/api/bookings` (with admin auth).

---

## Check that it works

1. **Booking:** Submit a reservation on the site. In Supabase → **Table Editor** → **bookings**, you should see a new row.
2. **Admin:** Open `/admin`, log in, and confirm the new booking appears. Use **Accept** to set its status to confirmed.

If bookings don’t appear:

- Confirm **`SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** are set in Vercel and that you redeployed after adding them.
- Check the **Vercel function logs** for errors (e.g. “SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set” or Supabase errors).
- In Supabase **Table Editor**, confirm the `bookings` table exists and has the columns above.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create a project at [supabase.com](https://supabase.com) → **New project**. |
| 2 | In **SQL Editor**, run the `create table public.bookings` script (and optionally enable RLS). |
| 2b | Create the `clients` table (SQL in Step 2b). |
| 2c | (Optional) Add `sent_emails` column to `bookings` for email status in admin (SQL in Step 2c). |
| 3 | In **Authentication** → **Users**, create an admin user (e.g. `admin@spinella.ch`, password **`spinellaadmin*1`**). |
| 4 | In **Project settings** → **API**, copy **Project URL**, **anon** key, and **service_role** key. |
| 5 | In Vercel, add **`SUPABASE_URL`**, **`SUPABASE_ANON_KEY`**, **`SUPABASE_SERVICE_ROLE_KEY`**, **`VITE_SUPABASE_URL`**, **`VITE_SUPABASE_ANON_KEY`** (and optionally **`ADMIN_EMAIL`**), then redeploy. |
| 6 | (Optional) Add the same variables to `.env` for local dev. |

After this, booking continues to work with Resend (emails), and Supabase is used to store and manage reservation data for the admin page.
