"use client";

import Link from "next/link";
import { devices } from "@/lib/devices";
import Backdrop from "@/components/Backdrop";
import Parallax from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";

export default function Outro() {
  return (
    <footer className="relative overflow-hidden pt-32 pb-14">
      <Backdrop tilt={-18} intensity={0.55} className="edge-fade-b" />

      <div className="shell relative">
        <Parallax depth={30}>
          <h2 className="display mb-16 max-w-[12ch] text-[var(--text)]">
            <Reveal>Ten units</Reveal>
            <Reveal delay={0.08}>One range</Reveal>
          </h2>
        </Parallax>

        {/* every unit, one last time, as a plain list */}
        <ul className="mb-20 grid grid-cols-2 gap-x-8 sm:grid-cols-3 lg:grid-cols-5">
          {devices.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/devices/${d.slug}`}
                className="group flex items-baseline gap-2 border-b border-white/[0.08] py-3 transition-colors hover:border-[var(--accent)]/50"
              >
                <span className="hud-tight text-[var(--faint)] transition-colors group-hover:text-[var(--accent)]">
                  {d.index}
                </span>
                <span className="device-name text-sm text-[var(--text)]">{d.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="hud-tight text-[var(--faint)]">
            syniotec · devices — a showroom of the telematics range
          </p>
          <p className="hud-tight text-[var(--faint)]">
            Hardware only. No pricing, no forms.
          </p>
        </div>
      </div>
    </footer>
  );
}
