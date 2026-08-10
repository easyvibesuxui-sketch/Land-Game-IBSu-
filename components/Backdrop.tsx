"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useReduced } from "@/lib/useReduced";

/**
 * The reference leans on full-bleed 3D chrome renders. Those assets can't be
 * sourced, so the atmosphere is generated instead: bundles of drawn filaments —
 * thin bright wires catching a deep red key light against a near-black field.
 *
 * Drawn as SVG strokes rather than blurred divs, because blur alone turns into
 * smoke; the look depends on the wires staying sharp at their core and only
 * their halo bleeding.
 */

type Props = {
  tilt?: number;
  intensity?: number;
  className?: string;
};

/** Deterministic pseudo-random, so server and client draw the same wires. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Wire = {
  d: string;
  w: number;
  hot: boolean;
  o: number;
};

function buildWires(seed: number, count: number): Wire[] {
  const r = rng(seed);
  const wires: Wire[] = [];
  for (let i = 0; i < count; i++) {
    /*
     * Wires are bundled around a few shared anchors rather than scattered
     * evenly — an even spread reads as falling rain, a bundle reads as cable.
     */
    const band = (i % 3) / 3;
    const y = band * 90 + r() * 34 - 8;
    const sway = 45 + r() * 110;
    const drop = (r() - 0.5) * 90;
    const d = `M-14 ${y} C 22 ${y - sway}, 58 ${y + drop + sway}, 114 ${y + drop}`;
    const hot = r() > 0.38;
    wires.push({
      d,
      // px, because the strokes are non-scaling
      w: 1 + r() * 4.5,
      hot,
      o: 0.22 + r() * 0.5,
    });
  }
  return wires;
}

export default function Backdrop({ tilt = 0, intensity = 1, className }: Props) {
  const reduced = useReduced();
  const uid = useId().replace(/:/g, "");
  const wires = buildWires(Math.round(Math.abs(tilt) * 977 + 41), 21);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ opacity: intensity }}
    >
      {/* Deep field */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 64% 26%, #241a1d 0%, #0d0a0c 46%, #050406 100%)",
        }}
      />

      {/* Hot core — the key light the wires catch */}
      <motion.div
        className="absolute"
        style={{
          top: "24%",
          left: "60%",
          width: "58vw",
          height: "58vw",
          maxWidth: 900,
          maxHeight: 900,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          background:
            "radial-gradient(circle, rgba(200,16,46,0.38) 0%, rgba(255,59,48,0.13) 40%, transparent 68%)",
        }}
        animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The filament bundle */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ transform: `rotate(${tilt}deg) scale(1.5)` }}
      >
        <defs>
          <linearGradient id={`${uid}-chrome`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="26%" stopColor="#c9d3de" stopOpacity="0.8" />
            <stop offset="52%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="76%" stopColor="#8f9bab" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-hot`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c8102e" stopOpacity="0" />
            <stop offset="30%" stopColor="#c8102e" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#ffd9d4" stopOpacity="1" />
            <stop offset="80%" stopColor="#ff3b30" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7a0a1c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/*
         * Three stroke passes give the glow: a wide faint bloom, a mid body,
         * and a sharp core highlight. Strokes rather than a Gaussian blur,
         * because the viewBox is stretched with preserveAspectRatio="none" and
         * a filter would smear horizontally into fog.
         *
         * The drift animates the two bands, not the 60-odd paths inside them —
         * animating each one held up the hero's own entrance by seconds.
         */}
        {(
          [
            { key: "chrome", dur: 26, drift: 1.4 },
            { key: "hot", dur: 34, drift: -2.1 },
          ] as const
        ).map((band) => (
          <motion.g
            key={band.key}
            animate={reduced ? undefined : { x: [-band.drift, band.drift, -band.drift] }}
            transition={{ duration: band.dur, repeat: Infinity, ease: "easeInOut" }}
          >
            {(
              [
                { mul: 7, alpha: 0.16 },
                { mul: 2.6, alpha: 0.42 },
                { mul: 1, alpha: 1 },
              ] as const
            ).map((pass, pi) =>
              wires
                .filter((w) => (band.key === "hot") === w.hot)
                .map((w, i) => (
                  <path
                    key={`${pi}-${i}`}
                    d={w.d}
                    stroke={`url(#${uid}-${band.key})`}
                    strokeWidth={w.w * pass.mul}
                    strokeLinecap="round"
                    fill="none"
                    opacity={w.o * pass.alpha}
                    vectorEffect="non-scaling-stroke"
                  />
                )),
            )}
          </motion.g>
        ))}
      </svg>

      {/* A whisper of turbulence, for tooth — not enough to fog the frame */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" preserveAspectRatio="none">
        <rect width="100%" height="100%" filter="url(#chrome-noise)" />
      </svg>

      {/* Vignette, so type always has a floor */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(118% 88% at 50% 45%, transparent 26%, rgba(5,5,7,0.62) 70%, rgba(5,5,7,0.95) 100%)",
        }}
      />
    </div>
  );
}
