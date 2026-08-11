"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { EASE } from "@/lib/motion";
import Backdrop from "@/components/Backdrop";
import GlassTile from "@/components/cards/GlassTile";
import DeviceArt from "@/components/device-art/DeviceArt";
import { RevealLines, FadeUp } from "@/components/Reveal";

/** The stat mosaic from the reference — deliberately unequal tiles. */
const STATS = [
  { value: "10", label: "Units in the range", slug: null, span: "col-span-2 row-span-1" },
  { value: "8y", label: "Longest battery life", slug: "dot", span: "col-span-1 row-span-2" },
  { value: "1m", label: "GNSS position accuracy", slug: null, span: "col-span-1 row-span-1" },
  { value: "90g", label: "Lightest unit", slug: "link-mini", span: "col-span-1 row-span-1" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /* Four depths, so the frame separates as the page leaves. */
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-58%"]);
  const tilesY = useTransform(scrollYProgress, [0, 1], ["0%", "-110%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const s = (v: unknown) => (reduced ? undefined : (v as never));

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ y: s(bgY), scale: s(bgScale) }}>
        <Backdrop tilt={-6} />
      </motion.div>
      <div aria-hidden className="blueprint absolute inset-0" />
      {/* Scrim on the type side — the reference keeps its left third dark so the
          headline never has to fight the render behind it. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(5,5,7,0.92) 0%, rgba(5,5,7,0.6) 32%, transparent 62%)",
        }}
      />

      <motion.div
        className="shell relative flex min-h-[100svh] flex-col justify-end pb-14 pt-[var(--nav-h)]"
        style={{ opacity: s(fade) }}
      >
        {/* `ch` must live on the element that carries the display size — on a
            wrapper it would resolve against the 16px body font and crush the line. */}
        <motion.div style={{ y: s(titleY) }} className="mb-auto mt-[14vh]">
          <h1 className="display max-w-[9ch] text-[var(--text)]">
            <RevealLines lines={["Every", "device,", "one range"]} />
          </h1>
        </motion.div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          {/* left: the label block from the reference */}
          <FadeUp delay={0.5} className="max-w-md">
            <div className="mb-5 flex items-center gap-4">
              <span
                aria-hidden
                className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-[var(--accent)]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12 L12 2 M5 2 H12 V9" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
              <p className="hud text-[var(--text)]">
                Telematics
                <br />
                hardware
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Seven telematics units for construction machinery — wired boxes reading the CAN
              bus, self-powered trackers for anything without a supply, and passive tags for
              the tools too small to carry either.
            </p>
          </FadeUp>

          {/* right: the unequal stat mosaic */}
          <motion.div
            style={{ y: s(tilesY) }}
            className="grid w-full max-w-[560px] grid-cols-3 grid-rows-2 gap-3"
            aria-label="Range at a glance"
          >
            {STATS.map((st, i) => (
              <FadeUp key={st.label} delay={0.65 + i * 0.08} className={st.span}>
                <GlassTile
                  shape="wide"
                  refract={i === 0}
                  tilt={4}
                  className="relative flex h-full min-h-[110px] flex-col justify-between overflow-hidden p-4"
                >
                  {st.slug && (
                    <DeviceArt
                      slug={st.slug}
                      className="pointer-events-none absolute -right-4 bottom-0 h-3/5 w-3/5 opacity-45"
                    />
                  )}
                  <span className="relative text-3xl font-extralight tracking-tight text-[var(--text)]">
                    {st.value}
                  </span>
                  <span className="hud-tight relative max-w-[10ch] leading-relaxed">
                    {st.label}
                  </span>
                </GlassTile>
              </FadeUp>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2"
        style={{ opacity: s(fade) }}
      >
        <motion.span
          className="hud block"
          animate={reduced ? undefined : { y: [0, 7, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: EASE }}
        >
          Scroll
        </motion.span>
      </motion.div>
    </section>
  );
}
