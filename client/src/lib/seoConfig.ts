/**
 * SEO config: base URL and per-route title + meta description.
 * Descriptions kept to ~150–165 chars for search snippets.
 */
export const SEO_BASE_URL = "https://www.spinella.ch";

export type RouteMeta = {
  title: string;
  description: string;
};

export const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: "Spinella Restaurant & Bar | Sicilian Cuisine in Geneva",
    description:
      "Three brothers bringing the soul of Sicily to Geneva. Traditional Sicilian dishes, handcrafted cocktails, warm hospitality. Reserve your table.",
  },
  "/menu": {
    title: "Italian Menu & Sicilian Tapas | Spinella Geneva",
    description:
      "Explore Spinella's Italian menu in Geneva: Sicilian cuisine, shareable tapas, and authentic dishes. Download the full menu.",
  },
  "/gallery": {
    title: "Gallery | Spinella Restaurant & Bar Geneva",
    description:
      "Experience the ambiance of Spinella. Interior, terrace, and the warmth of Geneva's top-ranked Sicilian restaurant.",
  },
  "/events": {
    title: "Private Events & Celebrations | Spinella Geneva",
    description:
      "Host your event at Spinella: birthdays, corporate dinners, cocktail parties. Custom menus for 20–50 guests in Geneva.",
  },
  "/about": {
    title: "Our Story | The Three Brothers | Spinella Geneva",
    description:
      "Salvatore, Marco, and Gabriele: three Sicilian brothers bringing authentic soul to Geneva. Discover the story behind Spinella.",
  },
  "/faq": {
    title: "FAQ | Spinella Restaurant & Bar Geneva",
    description:
      "Frequently asked questions: reservations, opening hours, dietary options, parking, and more. We're here to help.",
  },
  "/contact": {
    title: "Contact & Opening Hours | Spinella Geneva",
    description:
      "Find us at Rue Liotard 4, Geneva. Opening hours, map, phone, and email. Get in touch or reserve your table.",
  },
  "/reservations": {
    title: "Reserve Your Table | Spinella Geneva",
    description:
      "Book your table at Spinella online. Experience authentic Sicilian cuisine in the heart of Geneva. Easy reservation.",
  },
};

export function getMetaForPath(path: string): RouteMeta | undefined {
  const normalized = path === "" ? "/" : path.replace(/\/$/, "") || "/";
  return routeMeta[normalized];
}
