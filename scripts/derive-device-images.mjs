/*
 * Derive the served device images from the master photographs.
 *
 * The masters in assets/product-photos/ are already cut out on transparency
 * and run 1.5–4.5 MB each; nothing in public/ should be that heavy. Each is
 * trimmed to its content, capped on the long edge and re-encoded to WebP,
 * which is the only format that keeps the alpha and still lands under 100 KB.
 *
 * Run: node scripts/derive-device-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/product-photos";
const DST = "public/devices";
const MAX = 900;

/*
 * Background plates are handled separately: they are full-bleed, so they are
 * not trimmed and they get a wider cap and a lower quality — a backdrop under
 * a dark scrim shows compression far less than a product does.
 */
const BG_SRC = "assets/backgrounds";
const BG_DST = "public/bg";
const BG_MAX = 1920;

/** file in assets/backgrounds → name under public/bg */
const BACKGROUNDS = {
  "hero.png": "hero",
};

/** slug in lib/devices.ts → master filename */
const MAP = {
  core: "Core (Neu).png",
  lite: "syniotec LITE.png",
  obd: "syniotec OBD.png",
  link: "syniotec LINK.png",
  volt: "syniotec volt.png",
  solar: "syniotec SOLAR.png",
  tag: "syniotec-iot-metall-tag.png",
};

for (const [slug, name] of Object.entries(MAP)) {
  const out = path.join(DST, `${slug}.webp`);
  const info = await sharp(path.join(SRC, name))
    .trim({ threshold: 0 })
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 6, alphaQuality: 90 })
    .toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`${slug.padEnd(6)} ${`${info.width}x${info.height}`.padEnd(11)} ${String(kb).padStart(4)} KB  ← ${name}`);
}

if (fs.existsSync(BG_SRC)) {
  fs.mkdirSync(BG_DST, { recursive: true });
  for (const [name, out_name] of Object.entries(BACKGROUNDS)) {
    const from = path.join(BG_SRC, name);
    if (!fs.existsSync(from)) continue;
    const out = path.join(BG_DST, `${out_name}.webp`);
    const info = await sharp(from)
      .resize({ width: BG_MAX, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`${out_name.padEnd(6)} ${`${info.width}x${info.height}`.padEnd(11)} ${String(kb).padStart(4)} KB  ← ${name}`);
  }
}
