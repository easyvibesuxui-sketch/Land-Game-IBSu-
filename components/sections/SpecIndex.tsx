"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { devices } from "@/lib/devices";
import GlassTile from "@/components/cards/GlassTile";
import { Reveal } from "@/components/Reveal";
import DeviceArt from "@/components/device-art/DeviceArt";

/**
 * Pinned horizontal rail: the section holds while the track translates on x,
 * so all ten spec sheets pass the camera sideways. Under reduced motion the pin
 * is dropped and the rail becomes an ordinary horizontal scroller.
 */
export default function SpecIndex() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* Travel far enough to clear the last panel plus the shell padding. */
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-78%"]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  /*
   * One tree in both modes. Branching the markup on `reduced` meant the ref
   * lived only in the pinned branch, so the reduced-motion render left
   * useScroll pointing at an element that was never mounted.
   */
  return (
    <section
      ref={ref}
      id="index"
      className="relative"
      style={{ height: reduced ? "auto" : "520svh" }}
    >
      <div
        className={
          reduced
            ? "py-24"
            : "sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden"
        }
      >
        <div className="shell mb-14 flex items-end justify-between">
          <h2 className="display-sm text-[var(--text)]">
            <Reveal>Full index</Reveal>
          </h2>
          <span className="hud hidden md:block">
            {reduced ? "Scroll the rail" : "Scroll sideways"}
          </span>
        </div>

        <motion.div
          className={
            reduced
              ? "flex gap-5 overflow-x-auto px-[clamp(1.25rem,4vw,4.5rem)] pb-6"
              : "flex gap-5 pl-[clamp(1.25rem,4vw,4.5rem)]"
          }
          style={reduced ? undefined : { x }}
        >
          {devices.map((d) => (
            <SpecPanel key={d.slug} slug={d.slug} />
          ))}
        </motion.div>

        {/* progress hairline — meaningless once the rail scrolls on its own */}
        {!reduced && (
          <div className="shell mt-14">
            <div className="relative h-px w-full bg-white/12">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                style={{ width: progress }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SpecPanel({ slug }: { slug: string }) {
  const d = devices.find((x) => x.slug === slug)!;

  return (
    <GlassTile
      shape="wide"
      tilt={3}
      className="relative flex h-[58svh] w-[min(420px,80vw)] shrink-0 flex-col overflow-hidden p-7"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="hud-tight text-[var(--faint)]">{d.index}</span>
          <h3 className="device-name mt-2 text-3xl text-[var(--text)]">{d.name}</h3>
        </div>
        <DeviceArt slug={d.slug} className="h-20 w-20 shrink-0 opacity-90" />
      </div>

      <p className="mb-5 text-sm leading-relaxed text-[var(--muted)]">{d.tagline}</p>

      <dl className="min-h-0 flex-1 space-y-2 overflow-hidden">
        {d.specs.slice(0, 6).map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            className="flex justify-between gap-4 border-b border-white/[0.07] pb-1.5"
          >
            <dt className="hud-tight shrink-0 text-[var(--faint)]">{s.label}</dt>
            <dd className="text-right text-xs leading-snug text-[var(--text)]/85">{s.value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={`/devices/${d.slug}`}
        className="hud mt-5 inline-flex items-center gap-2 text-[var(--accent)]"
      >
        Full sheet
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 12 L12 2 M5 2 H12 V9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </Link>
    </GlassTile>
  );
}
