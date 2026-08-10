"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { GROUPS, byGroup } from "@/lib/devices";
import DeviceArt from "@/components/device-art/DeviceArt";

/**
 * The reference's hard contrast flip: the page drops from near-black to a pale
 * concrete grey, and an oversized headline scales up while the section is
 * pinned. Numbered columns sit underneath, as [001] [002] [003].
 */
export default function ClassFlip() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /*
   * The headline must already be on screen the moment the section pins —
   * ramping opacity from zero at progress 0 left a blank grey frame for the
   * first stretch of the scroll.
   */
  const scale = useTransform(scrollYProgress, [0, 0.55], [0.86, 1.42]);
  const y = useTransform(scrollYProgress, [0, 1], ["4%", "-14%"]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.62, 0.76], [1, 1, 0]);
  const colsOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const colsY = useTransform(scrollYProgress, [0.5, 0.75], [70, 0]);

  const s = (v: unknown) => (reduced ? undefined : (v as never));

  return (
    <section
      ref={ref}
      id="rail"
      className="relative h-[300svh]"
      style={{ background: "var(--light-bg)", color: "var(--light-text)" }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        {/* grain sits on the light surface too, so it reads as one material */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 20%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(80% 60% at 80% 90%, rgba(255,176,32,0.16), transparent 70%)",
          }}
        />

        <motion.h2
          className="display relative text-center"
          style={{ scale: s(scale), y: s(y), opacity: s(headOpacity) }}
        >
          Wired
          <br />
          Powered
          <br />
          Passive
        </motion.h2>

        <motion.div
          className="shell absolute inset-x-0 bottom-[8vh]"
          style={{ opacity: s(colsOpacity), y: s(colsY) }}
        >
          <div className="grid gap-10 md:grid-cols-3">
            {GROUPS.map((g, i) => (
              <div key={g.id} className="border-t border-black/25 pt-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="hud-tight mb-2"
                      style={{ color: "rgba(22,24,28,0.55)" }}
                    >
                      {g.label}
                    </p>
                    <p className="max-w-[34ch] text-sm leading-relaxed" style={{ color: "rgba(22,24,28,0.78)" }}>
                      {g.blurb}
                    </p>
                  </div>
                  <span className="hud-tight shrink-0" style={{ color: "rgba(22,24,28,0.45)" }}>
                    [{String(i + 1).padStart(3, "0")}]
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  {byGroup(g.id).map((d) => (
                    <div key={d.slug} className="group/unit relative">
                      <DeviceArt
                        slug={d.slug}
                        className="h-14 w-14 opacity-70 transition-opacity duration-500 group-hover/unit:opacity-100"
                      />
                    </div>
                  ))}
                  <span
                    className="hud-tight ml-auto"
                    style={{ color: "rgba(22,24,28,0.5)" }}
                  >
                    {byGroup(g.id).length} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
