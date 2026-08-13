"use client";

import { useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { EASE } from "@/lib/motion";
import GlassTile from "@/components/cards/GlassTile";
import DeviceArt from "@/components/device-art/DeviceArt";
import { RevealLines, FadeUp } from "@/components/Reveal";

/**
 * The stat mosaic from the reference — deliberately unequal tiles. Each figure
 * has to come off a device that is actually in the range, so this list moves
 * whenever the range does.
 */
const STATS = [
  { value: "7", label: "Units in the range", slug: null, span: "col-span-2 row-span-1" },
  { value: "5y", label: "Longest battery life", slug: "volt", span: "col-span-1 row-span-2" },
  { value: "CAN", label: "Bus-level machine data", slug: "core", span: "col-span-1 row-span-1" },
  { value: "0", label: "Power the tag needs", slug: "tag", span: "col-span-1 row-span-1" },
];

/*
 * The hero runs two and a bit viewport-heights tall and pins its contents for
 * the first one. That extra height is the scroll budget the VOLT teardown is
 * scrubbed against — the teardown itself belongs to Showcase, which carries it
 * behind this section and the two after it.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();

  /* 0 at the top of the section, 1 where its bottom meets the viewport bottom
     — which is exactly where the pinned frame unpins. */
  const scrollYProgress = useSectionProgress(ref);

  /* Kept shallow: the pinned frame is over two screens tall, so a deep offset
     travels far enough to lift the mosaic over the paragraph on one column. */
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const tilesY = useTransform(scrollYProgress, [0, 1], ["0%", "-26%"]);
  /* Content holds through the assembly and only leaves once the unit is whole. */
  const fade = useTransform(scrollYProgress, [0, 0.82, 0.97], [1, 1, 0]);
  const cue = useTransform(scrollYProgress, [0, 0.16], [1, 0]);

  const s = (v: unknown) => (reduced ? undefined : (v as never));

  return (
    <section ref={ref} id="hero" className="relative h-[240svh] w-full">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <motion.div
          className="shell relative flex h-svh flex-col justify-end pb-14 pt-[var(--nav-h)]"
          style={{ opacity: s(fade) }}
        >
          {/* `ch` must live on the element that carries the display size — on a
              wrapper it would resolve against the 16px body font and crush the line. */}
          <motion.div style={{ y: s(titleY) }} className="mb-auto mt-[13vh]">
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
              className="grid w-full max-w-[430px] grid-cols-3 grid-rows-2 gap-3"
              aria-label="Range at a glance"
            >
              {STATS.map((st, i) => (
                <FadeUp key={st.label} delay={0.65 + i * 0.08} className={st.span}>
                  <GlassTile
                    shape="wide"
                    refract={i === 0}
                    tilt={4}
                    className="relative flex h-full min-h-[92px] flex-col justify-between overflow-hidden p-4"
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

        {/* scroll cue — it has a real job here, so it says what it does */}
        <motion.div
          className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2"
          style={{ opacity: s(cue) }}
        >
          <motion.span
            className="hud block whitespace-nowrap"
            animate={reduced ? undefined : { y: [0, 7, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: EASE }}
          >
            Scroll to assemble
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
