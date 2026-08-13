"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import type { Device, PowerClass } from "@/lib/devices";
import { EASE } from "@/lib/motion";

import GlassTile from "./GlassTile";
import DeviceArt from "@/components/device-art/DeviceArt";
import { useAssemblyOnEnter } from "@/components/device-art/useAssembly";

/** Short enough to survive the narrowest card without wrapping awkwardly. */
const GROUP_SHORT: Record<PowerClass, string> = {
  wired: "Wired",
  "self-powered": "Self-powered",
  "off-grid": "Off-grid",
};

/**
 * Layout per silhouette. A capsule can't hold the same furniture as an arch,
 * so each shape gets its own interior rather than one layout stretched to fit.
 */
export default function DeviceCard({ device, className = "" }: { device: Device; className?: string }) {
  const reduced = useReduced();
  /* A slow, per-card idle drift. Offsetting the duration by index keeps the
     grid from breathing in unison, which reads as a page-wide wobble. */
  const drift = 6.5 + (Number(device.index) % 5) * 0.9;
  /* Shapes whose bottom corners curve away can't hold a left-aligned name
     plate — it lands outside the silhouette — so those centre theirs. */
  const centred =
    device.shape === "circle" || device.shape === "arch" || device.shape === "capsule";
  /* Cards that span two columns on one row: the unit sits to the right, taller
     than the card, with the name plate holding the left. */
  const band = device.shape === "wide" || device.shape === "beveled";
  const assembly = useAssemblyOnEnter<SVGSVGElement>(120);
  const isCircle = device.shape === "circle";

  return (
    <Link
      href={`/devices/${device.slug}`}
      /* A round card has to stay round: constrain it to a square and centre it
         in its cell, or border-radius:50% renders an ellipse. */
      className={`group block h-full ${isCircle ? "flex justify-center" : ""} ${className}`}
      aria-label={`${device.name} — ${device.tagline}`}
    >
      <GlassTile
        shape={device.shape}
        refract={device.shape === "arch"}
        className={`relative overflow-hidden ${
          isCircle ? "aspect-square h-full w-auto max-w-full" : "h-full"
        }`}
      >
        {/*
         * The top row has to clear each silhouette's missing corners — the
         * bevel cuts the top-right, and capsules and circles curve away from
         * it — or the class label gets sheared off by the clip.
         */}
        <div
          className={`absolute inset-x-0 top-0 z-10 flex items-start gap-3 p-5 ${
            /* The arch is a full dome across a 2×2 cell — anywhere near its
               corners is outside the shape, so its labels sit centred under
               the apex instead of pushed into them. */
            device.shape === "arch" ? "justify-center gap-10 pt-9" : "justify-between"
          } ${
            device.shape === "circle"
              ? "px-12 pt-9"
              : device.shape === "capsule"
                ? "px-14 pt-7"
                : device.shape === "beveled"
                  ? "pr-16"
                  : ""
          }`}
        >
          <span className="hud-tight shrink-0 text-[var(--faint)] transition-colors duration-500 group-hover:text-[var(--accent)]">
            {device.index}
          </span>
          <span className="hud-tight text-right leading-tight text-[var(--faint)]">
            {GROUP_SHORT[device.group]}
          </span>
        </div>

        {/* the unit */}
        {/*
         * `h-full w-auto` lets the square viewBox take the card's full height
         * and derive its own width — with `w-full` the SVG letterboxes inside a
         * wide cell and the unit shrinks to a thumbnail.
         */}
        <motion.div
          className={`absolute inset-0 z-[1] flex items-center ${
            band
              ? "justify-end pr-5"
              : device.shape === "circle"
                ? "justify-center px-12 pb-20 pt-14"
                : device.shape === "capsule"
                  ? "justify-center px-8 pb-16 pt-10"
                  : "justify-center px-4 pb-12 pt-9"
          }`}
          animate={reduced ? undefined : { y: [0, -7, 0] }}
          whileHover={reduced ? undefined : { scale: 1.06, y: -12 }}
          transition={{
            y: { duration: drift, repeat: Infinity, ease: "easeInOut" },
            default: { duration: 0.7, ease: EASE },
          }}
        >
          {/* Parts fly in and knit together as the card enters the viewport. */}
          <DeviceArt
            slug={device.slug}
            ref={assembly}
            className={band ? "h-[124%] w-auto" : "h-full w-auto max-w-full"}
          />
        </motion.div>

        {/* name plate */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 p-6 ${
            centred ? "text-center" : ""
          } ${device.shape === "circle" ? "pb-10" : ""}`}
        >
          {/* Every alignment utility comes from one branch: Tailwind emits its
              utilities in its own order, so pairing a base `items-end` with a
              conditional `items-center` lets the base silently win. */}
          <div
            className={`flex ${
              centred ? "flex-col items-center gap-1" : "items-end justify-between gap-3"
            }`}
          >
            <h3 className="device-name text-2xl leading-none text-[var(--text)] md:text-3xl">
              {device.name}
            </h3>
            <span className="hud-tight shrink-0 text-[var(--accent)]">{device.metric.value}</span>
          </div>

          {/* tagline unfurls on hover — the card stays quiet until asked */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
            <p className="overflow-hidden text-sm leading-snug text-[var(--muted)]">
              <span className="block pt-2">{device.tagline}</span>
            </p>
          </div>
        </div>

        {/* red wash on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 108%, rgba(200,16,46,0.28), transparent 70%)",
          }}
        />
      </GlassTile>
    </Link>
  );
}
