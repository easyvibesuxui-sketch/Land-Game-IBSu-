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
