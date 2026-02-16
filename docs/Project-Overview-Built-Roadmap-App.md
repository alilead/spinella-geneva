# Spinella Restaurant & Bar – Project Overview: What We Built, Takeaway, Roadmap & App

*Single reference for everything built on the website, the takeaway offering, what’s left to build, the future luxury cooking lessons platform, and turning it all into an app.*

---

## 1. What We Built on the Website

### 1.1 Public pages (spinella.ch)

| Page | Route | Purpose |
|------|--------|--------|
| **Home** | `/` | Hero video, philosophy quote, feature cards (Easy Booking, Authentic Cuisine → menu, Cocktail Bar, Private Events), Three Brothers preview, reviews, location CTA. |
| **Menu** | `/menu` | Hero + PDF download, intro story, pistachio tiramisu highlight, double-service notice. |
| **Gallery** | `/gallery` | Photo grid + lightbox. |
| **Events** | `/events` | Private events intro, event types, “What we offer” (custom menus, full service, atmosphere), capacity & details, booking info. |
| **About** | `/about` | Story, three brothers (Salvatore, Marco, Gabriele), philosophy (Passion, Respect, Authenticity, Family, Quality), experience section. |
| **FAQ** | `/faq` | Accordion FAQ (reservations, hours, dietary, parking, private events, takeaway/drinks, what makes Spinella different). Dress code Q removed. |
| **Contact** | `/contact` | Address, phone, email, opening hours (kitchen + bar in tables), map, transport info. |
| **Reservations** | `/reservations` | Booking form: name, email, phone, date, time, party size, special requests. Time slots by day (lunch/evening, Sunday closed). Submit → API → Supabase + optional emails (request or confirmed). |

- **Languages:** French (default), English, Italian – toggle in nav; same URLs.
- **Redirect:** `/booking` → `/reservations`.

### 1.2 Admin dashboard (`/admin`)

- **Auth:** Supabase (admin-only).
- **Tabs:** Richieste (requests), Confirmées, Refusées, Tous.
- **Actions per booking:** Accept / Decline, view details, edit date/time/status, sync from Resend.
- **Clients:** List, add, delete; linked to bookings.
- **Calendar view:** Month navigation, date strip, booking list.
- **Data source:** Supabase `bookings` + `clients` tables.

### 1.3 Backend & APIs

- **Booking (public):** `POST /api/booking` – validates, writes to Supabase, sends guest + restaurant emails (Resend). Request-only for 8+ guests or special dates; else auto-confirm.
- **Bookings (admin):** `GET/PATCH /api/bookings` – list/update bookings, send confirmation or decline emails.
- **Scripts:** Import Wix/CSV bookings, add single pending booking (e.g. Miguel), refresh clients.

### 1.4 SEO (implemented)

- **Sitemap:** `sitemap.xml` with 8 public URLs.
- **Robots:** `robots.txt` with sitemap link.
- **Canonical:** Per-route canonical tag via `SeoHead`.
- **Titles & descriptions:** Unique per route (~150–165 chars), in `seoConfig.ts`.
- **Open Graph:** `og:type`, `og:url`, `og:image` (absolute), `og:title`, `og:description`; updated per route.
- **JSON-LD:** Restaurant schema in `index.html` (name, address, phone, url, cuisine).

### 1.5 UX & content updates (done)

- Valentine banner and Events Valentine block removed.
- Home: “Découvrir la Sicile à Genève” button removed; Cuisine Authentique = Utensils icon + link to menu; Bar à Cocktails = Wine icon; “Réserver une table” removed from Three Brothers block.
- Gold icon circles: `gold-bg` forced to hex `#d4af37` so they stay golden on all phones.
- Events “What we offer” copy shortened (EN/FR/IT).
- FAQ: takeaway answer updated (selected drinks, ask at bar); dress code Q removed.

### 1.6 PWA & installability

- **Manifest:** `manifest.json` (Spinella Admin – start_url `/admin`, theme gold, icons 192/512).
- **Service worker:** `sw.js` for caching/offline.
- **Push:** Push notification helpers registered (for future admin “new booking” alerts).
- **Install prompt:** Handled in `main.tsx` for “Add to Home Screen”.

---

## 2. Takeaway Part

### 2.1 Current (live)

- **FAQ:** “Do you offer takeaway or delivery?” → Answer says the experience is at the restaurant; **selected drinks are available for take-out**; ask at the bar. (EN/FR/IT.)
- No dedicated takeaway page or order flow yet.

### 2.2 Planned (from feature requests)

- **Takeaway orders**
  - Online orders from the website.
  - Connection to a handheld for kitchen and/or lounge.
  - Delivery/collection options to be defined with the client.
- **Content:** Optionally list which drinks (or items) are available for take-out on a small Takeaway section or FAQ expansion.

---

## 3. What’s Left to Build (website)

### 3.1 Content / assets (client-dependent)

- Three Brothers: replace photo with one of all three siblings (new image).
- Menu: fix misplaced photo in PDF; remove “ - ” from dish descriptions in PDF if desired.
- Authenticity: remove “ - ” next to the word if it appears in PDF or other assets.

### 3.2 New features (to plan / develop)

| Feature | Scope |
|--------|--------|
| **Gift cards** | Dedicated section: payment + confirmation email, IBAN, unique code per card, prominent placement. |
| **Group menus** | Section for predefined group menus; PDF download (files to be provided). |
| **Menu layout** | Dishes and suggestions next to the menu (like old site). |
| **Takeaway orders** | See §2.2. |
| **Reservations** | Message field (restaurant → customer); 15‑min time slots; notifications when someone books (e.g. like The Fork Manager). |
| **Work with Spinella** | “Work with us” section: Kitchen, Service, Bars. |

### 3.3 SEO (optional next)

- **hreflang / multilingual URLs:** Only after defining language-URL strategy (e.g. /fr/, /en/) to avoid wrong signals.

---

## 4. New Platform: Luxury Cooking Lessons

*To be scoped and designed.*

- **Idea:** A platform to **teach people how to cook** – focused on **special luxury cooking lessons** (e.g. Sicilian fine dining, seasonal menus, wine pairing).
- **Possible directions (to decide with client):**
  - **On-site lessons:** Book a lesson at Spinella (date/time, group size, theme).
  - **Content hub:** Recipes, tips, short videos (complement to the restaurant).
  - **Hybrid:** Lessons at the restaurant + optional “at home” packs or digital guides.
- **Integration with current site:** New section “Cooking Lessons” or “École de cuisine” with:
  - Presentation of the offer (luxury, Sicilian, themes).
  - Calendar / booking for lessons (could reuse or extend reservation logic).
  - Pricing, duration, what’s included.
- **Back office:** Admin for lesson slots, participants, payments (or link to external payment/booking if preferred).

*Next step:* Workshop with client to define format (on-site only / digital / both), pricing, and whether it lives inside spinella.ch or a subdomain/mini-site.*

---

## 5. Transform Everything into an App

### 5.1 Current “app-like” base

- **PWA:** Manifest + service worker; installable from browser (e.g. “Add to Home Screen”). Best experience today: **admin** (manifest points to `/admin`).
- **Responsive:** All public and admin pages work on mobile and desktop.
- **Push:** Infrastructure for notifications is in place (e.g. for future “new booking” alerts).

### 5.2 Paths to “full app”

| Option | Description | Pros / cons |
|--------|-------------|-------------|
| **PWA for customers** | Second manifest (or same with `start_url: /`) so **guests** can install the site as an app. | Reuse current stack; one codebase; no app-store approval. Limited to web capabilities and store visibility. |
| **PWA + app store wrappers** | Wrap the PWA (e.g. TWA – Trusted Web Activity, or Capacitor) to publish on **Google Play / App Store**. | Same web codebase; presence in stores; possible push and native-like icon/splash. Requires store accounts and policies. |
| **Native app (React Native / Flutter)** | Separate app for booking, menu, lessons, etc. | Best UX and device integration; full control. Higher cost and two codebases (web + app). |
| **Hybrid (Capacitor + existing Vite/React)** | Package current site in Capacitor; add native plugins only where needed. | One codebase for web + iOS/Android; gradual “app” evolution. Need to maintain Capacitor and native builds. |

### 5.3 Suggested order

1. **Short term:** Extend PWA so the **public site** (not only admin) is installable; optional second manifest for “Spinella Geneva” with `start_url: /`. No new stack.
2. **Then:** Add push for **admin** (notify on new reservation) and, if desired, for **guests** (reminders, offers).
3. **If store presence is required:** Explore TWA (Android) and/or Capacitor to ship the same website as an app in stores.
4. **If a dedicated app experience is required later:** Plan a separate project (e.g. React Native) and re-use APIs and content strategy defined here.

---

## 6. Summary Table

| Area | Status | Next |
|------|--------|------|
| **Website (public)** | Built: Home, Menu, Gallery, Events, About, FAQ, Contact, Reservations; SEO; 3 languages. | Content/PDF tweaks; new features (gift cards, group menus, takeaway orders, Work with Spinella, reservations improvements). |
| **Admin** | Built: dashboard, bookings CRUD, clients, calendar, emails. | Notifications on new booking; optional message field to customer. |
| **Takeaway** | FAQ updated (drinks at bar). | Dedicated takeaway orders + handheld + delivery/collection. |
| **Cooking lessons** | Not started. | Define format (on-site / digital / both), pricing, booking; then add section + back office. |
| **App** | PWA (admin installable); responsive; push-ready. | Installable PWA for customers; push; then store wrappers (TWA/Capacitor) if needed. |
| **Performance** | Hero poster + video fade-in; GTM after load; fonts async; main CSS deferred; LCP preload; WebP + picture; explicit dimensions (CLS); route-level code splitting (React.lazy); optional critical CSS (run `pnpm add -D critters` to enable). Run `pnpm run generate-images` for WebP. | Re-test PageSpeed after deploy. |

---

## 7. Performance improvements (Feb 2025)

To improve PageSpeed (mobile was ~55, desktop ~69–81; FCP/LCP/CLS/TBT in focus):

- **Hero:** On **mobile**, the hero shows a static poster image only (no video download), so LCP is the preloaded image. On **desktop**, so it doesn’t block; the poster shows until the video is ready.
- **GTM:** Loaded **after `window.load`** (with a short timeout) so it doesn’t block initial parse and first paint.
- **Fonts:** Google Fonts stylesheet loads with `media="print"` and `onload="this.media='all'"` so it is **non-blocking**.
- **LCP preload:** `<link rel="preload" href="/spinella_interior.jpg" as="image" fetchpriority="high">` so the hero poster is requested early.
- **Hero layout:** Section has explicit `min-height` and `aspect-ratio` to reduce layout shift.
- **CLS:** All `<img>` elements have explicit **width** and **height** (or sit in aspect-ratio containers): Home (interior_brothers, spinella_exterior), About (interior_main), Gallery (grid thumbs), Navigation (logo), ManusDialog (logo). This reserves space and reduces Cumulative Layout Shift.
- **Mobile – render-blocking:** Main app stylesheet is loaded with `media="print"` and `onload="this.media='all'"` (Vite plugin `defer-stylesheet` runs after build) so it no longer blocks initial render (~330 ms savings).
- **Mobile – image delivery:** Hero poster, logo, interior_brothers and spinella_exterior use `<picture>` with WebP when available. Run `pnpm run generate-images` (requires `sharp` as devDependency) to generate `/spinella_interior.webp`, `/interior_brothers.webp`, `/spinella_exterior.webp`, `/logo-96.webp`, `/logo.webp` for smaller payloads and faster LCP.

- **Code splitting:** Non-home routes (Menu, Gallery, About, Events, FAQ, Contact, Booking, Admin, NotFound) are loaded with `React.lazy` and wrapped in `Suspense`; only the Home page is in the initial bundle to improve FCP/LCP and TBT.

- **Critical CSS (optional):** Plugin `critical-css` uses Critters when installed (`pnpm add -D critters`); otherwise no-ops. Re-run PageSpeed Insights after deploy.

---

*Document generated for Spinella Restaurant & Bar. Update this file as features are shipped or scope changes.*
