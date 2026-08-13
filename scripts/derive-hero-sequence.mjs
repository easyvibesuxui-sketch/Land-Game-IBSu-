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
/** 8 fps over a ~6 s clip lands on 48 frames — smooth to scrub, ~1.5 MB total. */
const FPS = 8;
const WIDTH = 820;

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
    await sharp(from)
      /*
       * Crush the near-black back to true black. The clip is matted on black
       * and the page composites it with `screen`, so the faint banding H.264
       * leaves in the matte would otherwise paint as a visible rectangle.
       */
      .linear(1.04, -9)
      .webp({ quality: 66, effort: 6 })
      .toFile(out);
    total += fs.statSync(out).size;
  }
  console.log(`${files.length} frames, ${Math.round(total / 1024)} KB total → ${DST}`);
  console.log("Set HERO_FRAME_COUNT in components/HeroSequence.tsx to", files.length);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
