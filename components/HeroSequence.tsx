"use client";

import { useEffect, useRef } from "react";
import { type MotionStyle, type MotionValue, motion } from "motion/react";
import { asset } from "@/lib/asset";
import { useReduced } from "@/lib/useReduced";

/** Frames in public/hero, written by scripts/derive-hero-sequence.mjs. */
export const HERO_FRAME_COUNT = 48;

const src = (i: number) => asset(`/hero/${String(i).padStart(3, "0")}.webp`);

/**
 * The VOLT teardown, scrubbed by scroll: frame 000 is the unit in pieces and
 * the last frame is it whole, so scrolling down assembles it.
 *
 * Drawn into a canvas rather than toggling 48 stacked <img> elements — the
 * browser decodes an image the first time it is displayed, and forty-eight
 * first displays during a scroll is forty-eight janks. Every frame is decoded
 * once up front and afterwards a frame change is a single drawImage.
 *
 * Loading goes in two passes: every sixth frame first, so a coarse scrub works
 * almost immediately, then the rest. Until a frame has arrived the nearest
 * earlier one is drawn, so the sequence degrades to a chunkier version of
 * itself instead of flashing empty.
 */
export default function HeroSequence({
  progress,
  /** Assembly completes at this fraction of the scroll range. */
  completeAt = 0.85,
  className = "",
  style,
}: {
  progress: MotionValue<number>;
  completeAt?: number;
  className?: string;
  /**
   * Any transform belongs here rather than on a wrapper: `mix-blend-mode`
   * blends an element with its nearest stacking-context ancestor, so a
   * transformed wrapper would isolate the canvas and its black matte would
   * paint as a rectangle instead of dropping out.
   */
  style?: MotionStyle;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const ready = useRef<boolean[]>([]);
  const drawn = useRef(-1);
  const reduced = useReduced();

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const paint = (i: number) => {
      // fall back to the nearest earlier frame that has arrived
      let f = i;
      while (f > 0 && !ready.current[f]) f--;
      if (!ready.current[f] || f === drawn.current) return;
      const img = frames.current[f];
      if (el.width !== img.naturalWidth) {
        el.width = img.naturalWidth;
        el.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(img, 0, 0);
      drawn.current = f;
    };

    const indexFor = (p: number) => {
      if (reduced) return HERO_FRAME_COUNT - 1;
      const t = Math.min(1, Math.max(0, p / completeAt));
      return Math.round(t * (HERO_FRAME_COUNT - 1));
    };

    frames.current = Array.from({ length: HERO_FRAME_COUNT }, () => new Image());
    ready.current = new Array(HERO_FRAME_COUNT).fill(false);

    let cancelled = false;
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = frames.current[i];
        img.onload = () => {
          ready.current[i] = true;
          // Redraw if this is the frame the scroll is currently asking for.
          if (!cancelled && indexFor(progress.get()) >= i && drawn.current < i) {
            paint(indexFor(progress.get()));
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src(i);
      });

    (async () => {
      const coarse = [];
      for (let i = 0; i < HERO_FRAME_COUNT; i += 6) coarse.push(i);
      if (!coarse.includes(HERO_FRAME_COUNT - 1)) coarse.push(HERO_FRAME_COUNT - 1);
      await Promise.all(coarse.map(load));
      if (cancelled) return;
      for (let i = 0; i < HERO_FRAME_COUNT; i++) {
        if (cancelled) return;
        if (!ready.current[i]) await load(i);
      }
    })();

    paint(indexFor(progress.get()));
    const stop = progress.on("change", (p) => paint(indexFor(p)));

    return () => {
      cancelled = true;
      stop();
    };
  }, [progress, completeAt, reduced]);

  return (
    <motion.canvas
      ref={canvas}
      aria-hidden
      className={className}
      /*
       * The clip is matted on pure black, so `screen` drops the matte entirely
       * and the unit sits on the backdrop with no rectangle around it.
       */
      /*
       * A feather on the top and bottom edges. The clip's own matte carries a
       * couple of near-black rows that survive as a faint band against the
       * backdrop; fading the edges removes them and costs nothing, since the
       * unit never reaches the frame's edge.
       */
      style={{
        mixBlendMode: "screen",
        maskImage:
          "linear-gradient(180deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
        ...style,
      }}
    />
  );
}
