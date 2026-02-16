# SEO Technical Report — Spinella Restaurant & Bar Geneva

**Document purpose:** Handover for external SEO analysis.  
**Site:** Spinella Restaurant & Bar (Geneva)  
**Stack:** React (Vite), client-side routing (wouter), deployed on Vercel.  
**Last updated:** February 2025  

---

## 1. Site overview

- **Type:** Restaurant & bar (Sicilian cuisine, Geneva).
- **Languages (UI):** French (default), English, Italian — toggled in-app, same URLs.
- **Main URLs (public):** See Section 5. All routes serve the same single-page app; meta tags are currently global (see Section 3).

---

## 2. Current meta tags & document head

**Source:** Single `index.html` (no per-route meta injection).

| Element | Current value |
|--------|----------------|
| **`<title>`** | Spinella Restaurant & Bar Geneva |
| **Meta description** | Spinella – Restaurant & Bar sicilien à Genève. Cuisine authentique, cocktails et accueil familial. Réservez votre table. |
| **`<html lang>`** | `fr` (fixed) |
| **Viewport** | width=device-width, initial-scale=1.0, maximum-scale=1 |

**Open Graph (social):**

| Property | Value |
|----------|--------|
| **og:title** | Spinella Restaurant & Bar Geneva |
| **og:description** | Restaurant & Bar sicilien à Genève. Cuisine authentique, cocktails et accueil familial. |
| **og:image** | `/logo.png` (relative path) |

**Not present in `<head>`:**

- `og:url`
- `og:type` (e.g. `website`)
- `og:locale` / `og:locale:alternate`
- Twitter Card tags (`twitter:card`, `twitter:title`, etc.)
- Canonical URL
- Any JSON-LD structured data (e.g. LocalBusiness, Restaurant)

---

## 3. Title & description behaviour

- **Same `<title>` and meta description on every URL.** There is no per-page or per-route meta (no react-helmet or equivalent).
- **Impact:** All indexed pages will show the same title/snippet in search results; no differentiation for Menu, Contact, Reservations, etc.

---

## 4. Technical SEO

| Item | Status |
|------|--------|
| **Sitemap** | None found (no `sitemap.xml` or dynamic sitemap). |
| **robots.txt** | None found in repo (Vercel may serve a default). |
| **Structured data** | No JSON-LD (e.g. LocalBusiness, Restaurant, opening hours). |
| **Canonical** | No canonical link tag. |
| **Analytics / GTM** | Google Tag Manager present (ID: GTM-TJRXH8T9). |
| **Rendering** | Client-side React; crawlers receive the same initial HTML for all routes (meta is static in `index.html`). |

---

## 5. Public routes (for sitemap / audit)

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/menu` | Menu |
| `/gallery` | Gallery |
| `/about` | About / story |
| `/events` | Events (e.g. private events, Valentine’s) |
| `/faq` | FAQ |
| `/contact` | Contact (address, hours, map) |
| `/reservations` | Booking / reservations |
| `/booking` | Redirects to `/reservations` |

**Not for indexing (if desired):** `/admin`, `/404`.

---

## 6. On-page content (titles & key text)

- Each main page has a single **`<h1>`** and supporting copy from a central `translations.ts` (EN/FR/IT).
- **Home:** e.g. “The Sicilian Soul in Geneva”, “The Three Brothers”, “Visit Us in Geneva”.
- **Other pages:** Dedicated `title`/`subtitle` (and where applicable `description`) keys per section (Menu, Gallery, About, Events, FAQ, Contact, Reservations).
- Content is suitable for keywords (Sicilian, Geneva, restaurant, bar, reservations); meta titles/descriptions are not yet aligned per page.

---

## 7. Known issues (summary for SEO team)

1. **Single global title and description** — No per-URL optimisation for Google snippets.
2. **og:image** — Relative URL (`/logo.png`); should be absolute for reliable social previews.
3. **Missing OG/Twitter** — No `og:url`, `og:type`, `og:locale`, or Twitter Card tags.
4. **No sitemap** — No `sitemap.xml` submitted (assumed).
5. **No structured data** — No LocalBusiness/Restaurant JSON-LD (rich results, opening hours).
6. **Single `lang`** — `lang="fr"` only; no per-page or alternate language signals (e.g. `hreflang`) for EN/IT.
7. **No canonical** — No explicit canonical URL per page.

---

## 8. Hosting & tools

- **Hosting:** Vercel (no built-in SEO audit; Speed Insights available for performance).
- **Recommendation:** Use Google Search Console, Lighthouse (SEO audit), and optional third-party SEO tools for full analysis.

---

## 9. Request to SEO team

Please use this document to:

1. Assess current indexing and search appearance (titles, descriptions, rich results).
2. Propose per-page title and meta description guidelines (and, if needed, canonical strategy).
3. Advise on sitemap, robots.txt, and structured data (LocalBusiness/Restaurant).
4. Advise on Open Graph and Twitter Card implementation (including absolute `og:image`).
5. Advise on multi-language strategy (FR/EN/IT) and `lang`/`hreflang` if relevant.

**Contact / questions:** [Add your contact or project owner details here.]
image.png