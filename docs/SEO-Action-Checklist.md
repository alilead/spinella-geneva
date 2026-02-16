# SEO Action Checklist (Priority Order) – Spinella Restaurant & Bar (Geneva)

*Client-facing technical handover. Safe, incremental SEO improvements.*

**Current public URLs:**  
https://www.spinella.ch/ | /menu | /gallery | /events | /about | /faq | /contact | /reservations

---

## Priority 1 – Indexing and Core Signals

| Action | Status | Implementation |
|--------|--------|----------------|
| **1.1 Sitemap** | Done | `client/public/sitemap.xml` lists all 8 public URLs. `client/public/robots.txt` references it. |
| **1.2 Canonical per route** | Done | `SeoHead` component sets `<link rel="canonical" href="https://www.spinella.ch/…">` on route change. Default in `index.html` for `/`. |

---

## Priority 2 – Local SEO and Structured Data

| Action | Status | Implementation |
|--------|--------|----------------|
| **2.1 JSON-LD Restaurant** | Done | `index.html` includes a `<script type="application/ld+json">` block with `@type: Restaurant`, name, address (Rue Liotard 4, Geneva, CH), url, telephone, servesCuisine. |

---

## Priority 3 – Page Titles and Meta Descriptions

| Action | Status | Implementation |
|--------|--------|----------------|
| **3.1 Unique title + description per route** | Done | `client/src/lib/seoConfig.ts` defines `routeMeta` for each public path. `SeoHead` updates `document.title` and `meta[name="description"]` on navigation. |
| **3.2 Descriptions ~150–165 chars** | Done | All entries in `seoConfig.ts` respect this length. |

---

## Priority 4 – Social Metadata (Open Graph)

| Action | Status | Implementation |
|--------|--------|----------------|
| **4.1 Complete OG + absolute og:image** | Done | `index.html`: `og:type`, `og:url`, `og:image` (https://www.spinella.ch/logo.png), `og:title`, `og:description`. `SeoHead` updates OG tags per route when the app runs. |

---

## Priority 5 – Languages (Plan Before Implementing)

| Action | Status | Note |
|--------|--------|------|
| **5.1 Multilingual SEO / hreflang** | Not done | UI language toggle shares the same URLs. Confirm URL strategy (e.g. /fr/, /en/) before adding hreflang to avoid misimplementation. |

---

## Out of Scope

- No URL structure changes.
- No refactor of React/Vite stack.
- Focus remains on safe signals: sitemap, canonical, structured data, per-page metadata.
