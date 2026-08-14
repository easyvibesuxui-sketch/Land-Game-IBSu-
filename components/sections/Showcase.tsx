"use client";

import { useRef, type ReactNode } from "react";
import { motion, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { useSectionProgress } from "@/lib/useSectionProgress";
import Backdrop from "@/components/Backdrop";
import { HERO_BG } from "@/lib/backdrop";
import HeroSequence from "@/components/HeroSequence";

/**
 * One pinned background for the dark half of the page — the hero and the
 * marquee — with the VOLT teardown scrubbed across it.
 *
 * The atmosphere and the teardown live here rather than inside each section
 * because they have to be continuous: sections each painting their own backdrop
 * would restart the gradient at every boundary and, worse, the later ones would
 * paint straight over the shared sequence.
 *
 * The layer stays pinned for the full run without occupying any height of its
 * own — see the note on the zero-height sticky box below.
 */
export default function Showcase({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();

  const scrollYProgress = useSectionProgress(ref);

  /* The unit grows as it comes together, then drifts on out. */
  const scale = useTransform(scrollYProgress, [0, 0.9, 1], [0.94, 1.06, 1.1]);
  const y = useTransform(scrollYProgress, [0, 1], ["2%", "-9%"]);
  /* A scrim closes the run, so the handover to the light section is not a cut. */
  const veil = useTransform(scrollYProgress, [0.86, 1], [0, 0.5]);

  const s = (v: unknown) => (reduced ? undefined : (v as never));

  return (
    <div ref={ref} className="relative">
      {/*
        The sticky box is zero-height and the layer inside it is absolute, so the
        pinned background takes no space in the flow. A sticky element with real
        height would have to be pulled back with a negative margin, and that
        shifts every child's offset — which quietly wrecks the scroll maths of
        the pinned hero inside.
      */}
      <div className="pointer-events-none sticky top-0 z-0 h-0 w-full">
        <div className="absolute left-0 top-0 h-svh w-full overflow-hidden">
          <Backdrop tilt={-6} image={HERO_BG} />

          {/* the teardown, full-bleed — the transform sits on the canvas itself so
              nothing between it and the backdrop forms a blend group */}
          <HeroSequence
            progress={scrollYProgress}
            completeAt={0.9}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ scale: s(scale), y: s(y) }}
          />

          {/* Scrim on the type side — the headline never has to fight the unit. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(5,5,7,0.9) 0%, rgba(5,5,7,0.58) 30%, rgba(5,5,7,0.12) 54%, transparent 72%)",
            }}
          />
          {/* One column on a phone puts the type straight over the unit. */}
          <div
            aria-hidden
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(5,5,7,0.5) 24%, rgba(5,5,7,0.93) 46%)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[var(--bg)]"
            style={{ opacity: s(veil) }}
          />
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
