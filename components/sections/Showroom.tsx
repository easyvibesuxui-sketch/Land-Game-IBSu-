"use client";

import { devices } from "@/lib/devices";
import Backdrop from "@/components/Backdrop";
import DeviceCard from "@/components/cards/DeviceCard";
import Parallax from "@/components/Parallax";
import { Reveal, FadeUp } from "@/components/Reveal";

/*
 * Ten devices, deliberately not ten identical rectangles. Each card is placed
 * by area name so the silhouettes interlock; the whole thing collapses to one
 * column below 900px, where the extreme radii would read as broken.
 */
/*
 * Areas are matched to silhouettes, not assigned arbitrarily: the arch gets the
 * 2×2 block, the tall box a 1×2 column, the wide cards a 2×1 band, and the
 * circle and capsules land on single square cells so they stay round rather
 * than stretching into ellipses.
 */
const AREAS: Record<string, string> = {
  core: "a", // arch    · 2 × 2
  edge: "b", // tall    · 1 × 2
  "link-mini": "c", // capsule · 1 × 1
  tag: "d", // circle  · 1 × 1
  lite: "e", // wide    · 2 × 1
  link: "f", // squircle· 1 × 1
  obd: "g", // squircle· 1 × 1
  volt: "h", // wide    · 2 × 1
  solar: "i", // beveled · 1 × 1
  dot: "j", // capsule · 1 × 1
};

/* Alternating parallax depths give the grid its drift as you pass it. */
/* Kept shallow — deeper travel looked good in isolation but drifted
   neighbouring cards into each other's cells. */
const DEPTH: Record<string, number> = {
  core: 16,
  edge: -10,
  "link-mini": 20,
  lite: -8,
  obd: 12,
  link: -16,
  volt: 9,
  dot: -18,
  solar: 14,
  tag: -11,
};

export default function Showroom() {
  return (
    <section id="showroom" className="relative overflow-hidden py-28 md:py-40">
      <Backdrop tilt={12} intensity={0.7} className="opacity-70" />

      <div className="shell relative">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display-sm max-w-[13ch] text-[var(--text)]">
            <Reveal>The range</Reveal>
          </h2>
          <FadeUp delay={0.15} className="max-w-sm">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Ten units, one platform. Pick by how the asset is powered, not by what it
              costs — the network and the data are the same either way.
            </p>
          </FadeUp>
        </div>

        <div className="device-grid">
          {devices.map((d, i) => (
            <div key={d.slug} style={{ gridArea: AREAS[d.slug] }} className="min-h-0">
              <Parallax depth={DEPTH[d.slug]} className="h-full">
                <FadeUp delay={(i % 4) * 0.07} className="h-full">
                  <DeviceCard device={d} />
                </FadeUp>
              </Parallax>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .device-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          grid-auto-rows: 230px;
          grid-template-areas:
            "a a b c"
            "a a b d"
            "e e f g"
            "h h i j";
        }
        @media (max-width: 1180px) {
          .device-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-areas:
              "a a"
              "b c"
              "d e"
              "f g"
              "h h"
              "i j";
          }
        }
        @media (max-width: 900px) {
          .device-grid {
            grid-template-columns: minmax(0, 1fr);
            grid-auto-rows: 300px;
            grid-template-areas:
              "a" "b" "c" "d" "e" "f" "g" "h" "i" "j";
          }
        }
      `}</style>
    </section>
  );
}
