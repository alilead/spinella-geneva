#!/usr/bin/env node
/**
 * Generates WebP and resized images for better mobile performance (Lighthouse).
 * Run: pnpm run generate-images (from project root).
 * Requires: pnpm add -D sharp
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "client", "public");

const IMAGES = [
  { in: "spinella_interior.jpg", webp: "spinella_interior.webp", maxWidth: 1400 },
  { in: "interior_brothers.jpg", webp: "interior_brothers.webp", maxWidth: 1200 },
  { in: "spinella_exterior.jpg", webp: "spinella_exterior.webp", maxWidth: 1200 },
];

const LOGO = { in: "logo.png", webp: "logo.webp", small: "logo-96.webp", maxHeight: 96 };

async function run() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("Optional: install sharp for image generation: pnpm add -D sharp");
    return;
  }

  for (const { in: name, webp, maxWidth } of IMAGES) {
    const src = path.join(publicDir, name);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(publicDir, webp);
    await sharp(src)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest);
    console.log("Generated:", webp);
  }

  const logoPath = path.join(publicDir, LOGO.in);
  if (fs.existsSync(logoPath)) {
    const base = path.join(publicDir, path.basename(LOGO.in, path.extname(LOGO.in)));
    await sharp(logoPath)
      .resize(null, LOGO.maxHeight, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(base + "-96.webp");
    console.log("Generated: logo-96.webp");
    await sharp(logoPath)
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, LOGO.webp));
    console.log("Generated:", LOGO.webp);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
