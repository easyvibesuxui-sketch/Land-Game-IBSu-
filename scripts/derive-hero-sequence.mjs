/*
 * Chop the VOLT teardown clip into the frame sequence the hero scrubs.
 *
 * The clip runs assembled → exploded; the page runs the other way, so frames
 * are written in reverse: 000 is the unit in pieces, the last one is it whole.
 *
 * Needs ffmpeg on PATH (not a project dependency — this is run by hand when the
 * clip changes, and the output is committed).
 *
 * Run: node scripts/derive-hero-sequence.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const CLIP = "assets/hero-sequence/volt-exploded.mp4";
const DST = "public/hero";
/*
 * 6 fps over a ~6 s clip lands on 36 frames. Fewer and smaller than the opaque
 * version was, because a real alpha channel roughly doubles the bytes per frame
 * — it is a second image. 36 is still ~33 px of scroll per frame, which reads
 * as continuous.
 */
const FPS = 6;
const WIDTH = 760;
/** Below this the un-premultiply amplifies compression noise instead of colour. */
const ALPHA_FLOOR = 72;

if (!fs.existsSync(CLIP)) throw new Error(`missing ${CLIP}`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hero-seq-"));
try {
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error",
    "-i", CLIP,
    "-vf", `fps=${FPS},scale=${WIDTH}:-2`,
    "-vsync", "0",
    path.join(tmp, "f%03d.png"),
  ]);

  const files = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  fs.rmSync(DST, { recursive: true, force: true });
  fs.mkdirSync(DST, { recursive: true });

  let total = 0;
  for (let i = 0; i < files.length; i++) {
    const from = path.join(tmp, files[files.length - 1 - i]);
    const out = path.join(DST, `${String(i).padStart(3, "0")}.webp`);

    /*
     * Crush the near-black back to true black first — H.264 leaves faint
     * banding in the matte and it would survive as a haze once the matte
     * becomes alpha.
     */
    const { data, info } = await sharp(from)
      .linear(1.04, -9)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    /*
     * Black matte → alpha, the standard conversion for footage shot on black:
     * alpha is the brightest channel, and the colour is un-premultiplied by it.
     * Composited normally over any background this reproduces exactly what
     * `screen` produced over black — but it stays transparent where the matte
     * was, so the page shows through instead of a black rectangle.
     */
    const px = info.width * info.height;
    const rgba = Buffer.allocUnsafe(px * 4);
    for (let p = 0; p < px; p++) {
      const r = data[p * 3];
      const g = data[p * 3 + 1];
      const b = data[p * 3 + 2];
      let a = Math.max(r, g, b);
      if (a < 5) a = 0;
      rgba[p * 4 + 3] = a;
      if (a === 0) {
        rgba[p * 4] = 0;
        rgba[p * 4 + 1] = 0;
        rgba[p * 4 + 2] = 0;
      } else {
        const k = 255 / Math.max(a, ALPHA_FLOOR);
        rgba[p * 4] = Math.min(255, Math.round(r * k));
        rgba[p * 4 + 1] = Math.min(255, Math.round(g * k));
        rgba[p * 4 + 2] = Math.min(255, Math.round(b * k));
      }
    }

    await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 50, alphaQuality: 40, effort: 6 })
      .toFile(out);
    total += fs.statSync(out).size;
  }
  console.log(`${files.length} frames, ${Math.round(total / 1024)} KB total → ${DST}`);
  console.log("Set HERO_FRAME_COUNT in components/HeroSequence.tsx to", files.length);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
