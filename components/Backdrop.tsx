"use client";

import { motion } from "motion/react";
import { asset } from "@/lib/asset";
import { useReduced } from "@/lib/useReduced";

/**
 * The atmosphere behind the dark sections.
 *
 * Deliberately built from horizontals and verticals only. The earlier version
 * swept diagonal filaments across the frame, which fought the hardware for
 * attention — a product this precise wants a measured field behind it, not
 * weather. What is left is a deep ground, one soft key light, a fine measuring
 * grid and a few full-width rules: instrument, not illustration.
 *
 * `tilt` and `intensity` survive as the two dials each section uses: one places
 * the key light across the frame, the other sets the overall level.
 */

type Props = {
  /** Shifts the key light across the frame, roughly -20…20. */
  tilt?: number;
  intensity?: number;
  className?: string;
  /**
   * Photographic plate laid under the drawn layer. See lib/backdrop.ts — it is
   * additive: with no image the generated backdrop is unchanged.
   */
  image?: string | null;
  imageOpacity?: number;
};

export default function Backdrop({
  tilt = 0,
  intensity = 1,
  className,
  image = null,
  imageOpacity = 0.55,
}: Props) {
  const reduced = useReduced();
  /* One number places the light, so sections differ without differing in kind. */
  const lightX = 50 + tilt * 1.6;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ opacity: intensity }}
    >
      {/* Ground */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at ${lightX}% 22%, #1a1418 0%, #0b0a0c 44%, #050406 100%)`,
        }}
      />

      {/* The photographic plate, if one exists: above the ground, below the
          light and the grid, so those still sit over it. */}
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${asset(image)})`,
            opacity: imageOpacity,
            transform: "scale(1.06)",
            maskImage:
              "linear-gradient(105deg, transparent 0%, rgba(0,0,0,0.55) 34%, #000 68%)",
            WebkitMaskImage:
              "linear-gradient(105deg, transparent 0%, rgba(0,0,0,0.55) 34%, #000 68%)",
          }}
        />
      )}

      {/* Key light. It breathes rather than travels — motion without direction. */}
      <motion.div
        className="absolute"
        style={{
          top: "16%",
          left: `${lightX}%`,
          width: "70vw",
          height: "70vw",
          maxWidth: 1100,
          maxHeight: 1100,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          filter: "blur(90px)",
          background:
            "radial-gradient(circle, rgba(200,16,46,0.30) 0%, rgba(255,59,48,0.10) 42%, transparent 70%)",
        }}
        animate={reduced ? undefined : { scale: [1, 1.07, 1], opacity: [0.82, 1, 0.82] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Measuring grid — square, aligned, faint enough to be felt not read. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage: `radial-gradient(115% 85% at ${lightX}% 26%, #000 15%, transparent 74%)`,
          WebkitMaskImage: `radial-gradient(115% 85% at ${lightX}% 26%, #000 15%, transparent 74%)`,
        }}
      />

      {/* A few full-width rules, the way a datasheet is ruled. */}
      {[18, 46, 74].map((top, i) => (
        <div
          key={top}
          className="absolute inset-x-0"
          style={{
            top: `${top}%`,
            height: 1,
            background:
              i === 1
                ? "linear-gradient(90deg, transparent, rgba(200,16,46,0.34) 42%, rgba(255,59,48,0.16) 58%, transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,255,255,0.11) 40%, transparent 82%)",
          }}
        />
      ))}

      {/* Vignette, so the frame closes rather than fading off. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 115% at 50% 45%, transparent 48%, rgba(3,3,5,0.55) 100%)",
        }}
      />
    </div>
  );
}
