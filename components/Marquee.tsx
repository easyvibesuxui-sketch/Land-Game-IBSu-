"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useReduced } from "@/lib/useReduced";

/**
 * A band of type running sideways under its own power, with the scroll adding
 * to it — the page keeps moving even when the reader has stopped.
 *
 * The track holds the items twice and translates by exactly -50%, so the second
 * copy lands where the first began and the loop has no seam. Duplicated content
 * is decorative, hence `aria-hidden` on the whole band.
 */
export default function Marquee({
  items,
  duration = 26,
  reverse = false,
  className = "",
}: {
  items: string[];
  /** Seconds for one full pass. */
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* Scroll shoves the band along; the spring keeps the shove from snapping. */
  const shove = useSpring(useTransform(scrollYProgress, [0, 1], [0, reverse ? 180 : -180]), {
    stiffness: 60,
    damping: 24,
    mass: 0.6,
  });

  const row = [...items, ...items];

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative overflow-hidden border-y border-white/10 py-4 ${className}`}
    >
      <motion.div style={{ x: reduced ? 0 : shove }}>
        <motion.div
          className="flex w-max gap-10 whitespace-nowrap"
          animate={reduced ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {row.map((item, i) => (
            <span key={i} className="hud flex items-center gap-10 text-[var(--faint)]">
              {item}
              <span className="text-[var(--accent)]">/</span>
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* fade the ends into the page rather than cutting them */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--bg) 0%, transparent 12%, transparent 88%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
