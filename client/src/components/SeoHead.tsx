import { useEffect } from "react";
import { useLocation } from "wouter";
import { SEO_BASE_URL, getMetaForPath } from "@/lib/seoConfig";

/**
 * Updates document head per route: title, canonical, meta description, and OG tags.
 * Keeps indexing and social previews aligned with the current page.
 */
export default function SeoHead() {
  const [path] = useLocation();
  const normalizedPath = path === "" ? "/" : path.replace(/\/$/, "") || "/";
  const meta = getMetaForPath(normalizedPath);
  const canonicalUrl = `${SEO_BASE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;

  useEffect(() => {
    const title = meta?.title ?? "Spinella Restaurant & Bar Geneva";
    const description =
      meta?.description ??
      "Spinella – Restaurant & Bar sicilien à Genève. Cuisine authentique, cocktails et accueil familial. Réservez votre table.";

    document.title = title;

    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.rel = "canonical";
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    // Open Graph
    const setOg = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setOg("og:title", title);
    setOg("og:description", description);
    setOg("og:url", canonicalUrl);
    setOg("og:type", "website");
    setOg("og:image", `${SEO_BASE_URL}/logo.png`);
  }, [normalizedPath, meta, canonicalUrl]);

  return null;
}
