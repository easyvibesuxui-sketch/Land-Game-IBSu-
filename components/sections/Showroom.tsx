"use client";

import { devices } from "@/lib/devices";
import Backdrop from "@/components/Backdrop";
import DeviceCard from "@/components/cards/DeviceCard";
import Parallax from "@/components/Parallax";
import { Reveal, FadeUp } from "@/components/Reveal";

/*
 * Seven devices, deliberately not seven identical rectangles. Each card is
 * placed by area name so the silhouettes interlock; the whole thing collapses
 * to one column below 900px, where the extreme radii would read as broken.
 *
 * Areas follow each unit's photograph, not an arbitrary pattern: CORE stands
 * portrait so it takes the 2×2 block, SOLAR is a tall panel and gets the 1×2
 * column, TAG is a landscape plate and gets the 2×1 band, and the rest sit on
 * square cells where the circle stays round rather than stretching.
 */
const AREAS: Record<string, string> = {
  core: "a", //  arch     · 2 × 2
  solar: "b", // tall     · 1 × 2
  obd: "c", //   capsule  · 1 × 1
  link: "d", //  circle   · 1 × 1
  lite: "e", //  squircle · 1 × 1
  volt: "f", //  squircle · 1 × 1
  tag: "g", //   beveled  · 2 × 1
};

/* Alternating parallax depths give the grid its drift as you pass it. */
/* Kept shallow — deeper travel looked good in isolation but drifted
   neighbouring cards into each other's cells. */
const DEPTH: Record<string, number> = {
  core: 16,
  solar: -10,
  obd: 12,
  link: -16,
  lite: -8,
  volt: 9,
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
              Seven units, one platform. Pick by how the asset is powered, not by what it
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
            "e f g g";
        }
        @media (max-width: 1180px) {
          .device-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-areas:
              "a a"
              "a a"
              "b c"
              "b d"
              "e f"
              "g g";
          }
        }
        @media (max-width: 900px) {
          .device-grid {
            grid-template-columns: minmax(0, 1fr);
            grid-auto-rows: 300px;
            grid-template-areas:
              "a" "b" "c" "d" "e" "f" "g";
          }
        }
      `}</style>
    </section>
  );
}
