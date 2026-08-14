"use client";

import { useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { useSectionProgress } from "@/lib/useSectionProgress";

/**
 * The hard contrast flip: the page drops from near-black to a pale concrete
 * grey and one oversized statement scales up while the section is pinned.
 *
 * It is only the statement. It used to carry a row of class columns at the
 * bottom, and the two could not share the frame — the headline is still at full
 * size while the columns arrive, so they printed over each other. The columns
 * are gone rather than shrunk: this is the page's one breath between the
 * hardware and the index, and it works by holding a single idea.
 */
export default function ClassFlip() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();

  const progress = useSectionProgress(ref);

  /*
   * The statement is at full size well before the section releases — it used to
   * still be growing as the pin ended, which read as never quite arriving.
   */
  const scale = useTransform(progress, [0, 0.62], [0.88, 1.34]);
  const y = useTransform(progress, [0, 1], ["3%", "-9%"]);
  /* Present from the first pinned frame — ramping from zero left a blank grey
     screen for the opening stretch of the scroll, which reads as a bug. */
  const opacity = useTransform(progress, [0, 0.88, 1], [1, 1, 0]);
  /* The grey lifts as the statement lands, then settles again on the way out. */
  const wash = useTransform(progress, [0, 0.55, 1], [0.35, 0.62, 0.3]);

  const s = (v: unknown) => (reduced ? undefined : (v as never));

  return (
    <section
      ref={ref}
      id="rail"
      className="relative h-[210svh]"
      style={{ background: "var(--light-bg)", color: "var(--light-text)" }}
    >
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: s(wash),
            background:
              "radial-gradient(120% 80% at 50% 18%, rgba(255,255,255,0.7), transparent 60%), radial-gradient(80% 60% at 82% 92%, rgba(200,16,46,0.18), transparent 70%)",
          }}
        />

        <motion.h2
          className="display relative px-6 text-center"
          style={{ scale: s(scale), y: s(y), opacity: s(opacity) }}
        >
          Wired
          <br />
          Powered
          <br />
          Passive
        </motion.h2>
      </div>
    </section>
  );
}
