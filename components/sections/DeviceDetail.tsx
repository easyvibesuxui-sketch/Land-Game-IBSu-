"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { devices, type Device } from "@/lib/devices";
import Backdrop from "@/components/Backdrop";
import GlassTile from "@/components/cards/GlassTile";
import DeviceArt from "@/components/device-art/DeviceArt";
import Parallax from "@/components/Parallax";
import { useAssemblyScrub } from "@/components/device-art/useAssembly";
import { Reveal, FadeUp } from "@/components/Reveal";

export default function DeviceDetail({ device }: { device: Device }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const artRotate = useTransform(scrollYProgress, [0, 1], [0, 14]);

  /* The hero scrub is the centrepiece here: the unit assembles as you enter it. */
  const art = useRef<SVGSVGElement>(null);
  useAssemblyScrub(art, scrollYProgress, 0.34);

  const i = devices.findIndex((d) => d.slug === device.slug);
  const next = devices[(i + 1) % devices.length];
  const prev = devices[(i - 1 + devices.length) % devices.length];

  const s = (v: unknown) => (reduced ? undefined : (v as never));

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section ref={ref} className="relative min-h-[92svh] overflow-hidden">
        <Backdrop tilt={8} />

        <div className="shell relative grid min-h-[92svh] items-center gap-12 pb-20 pt-[calc(var(--nav-h)+4rem)] lg:grid-cols-2">
          <div>
            <FadeUp>
              <Link href="/#showroom" className="hud link-underline mb-8 inline-block">
                ← All devices
              </Link>
            </FadeUp>

            <p className="hud mb-5">
              {device.index} · {device.groupLabel}
            </p>

            <h1 className="display mb-7 text-[var(--text)]">
              <Reveal>{device.name}</Reveal>
            </h1>

            <FadeUp delay={0.15}>
              <p className="display-sm mb-8 max-w-[18ch] text-[var(--muted)]">
                {device.tagline}
              </p>
              <p className="max-w-lg text-sm leading-relaxed text-[var(--muted)]">
                {device.summary}
              </p>
            </FadeUp>

            <FadeUp delay={0.28} className="mt-9 flex flex-wrap gap-2">
              {device.fitFor.map((f) => (
                <span
                  key={f}
                  className="hud-tight rounded-full border border-white/15 px-3.5 py-2 text-[var(--text)]"
                >
                  {f}
                </span>
              ))}
            </FadeUp>
          </div>

          {/* the unit, floating and drifting */}
          <motion.div
            className="relative mx-auto w-full max-w-[460px]"
            style={{ y: s(artY), rotate: s(artRotate) }}
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(200,16,46,0.26), transparent 62%)",
                filter: "blur(30px)",
              }}
            />
            <motion.div
              animate={reduced ? undefined : { y: [0, -16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <DeviceArt slug={device.slug} ref={art} className="h-auto w-full drop-shadow-2xl" />
            </motion.div>

            {/* the headline metric, as a floating chip */}
            <GlassTile
              shape="capsule"
              tilt={8}
              className="absolute -bottom-2 right-2 flex items-center gap-3 px-6 py-3"
            >
              <span className="text-2xl font-extralight text-[var(--accent)]">
                {device.metric.value}
              </span>
              <span className="hud-tight max-w-[12ch] leading-tight">
                {device.metric.label}
              </span>
            </GlassTile>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------ specs */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <Backdrop tilt={-14} intensity={0.5} className="opacity-60" />
        <div className="shell relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="display-sm text-[var(--text)]">
              <Reveal>Specification</Reveal>
            </h2>
          </div>

          <Parallax depth={26}>
            <dl>
              {device.specs.map((spec, idx) => (
                <FadeUp key={`${spec.label}-${idx}`} delay={idx * 0.05}>
                  <div className="grid grid-cols-[minmax(120px,0.4fr)_1fr] items-baseline gap-6 border-b border-white/[0.09] py-4">
                    <dt className="hud-tight text-[var(--faint)]">{spec.label}</dt>
                    <dd className="text-sm leading-relaxed text-[var(--text)]">
                      {spec.value}
                    </dd>
                  </div>
                </FadeUp>
              ))}
            </dl>
          </Parallax>
        </div>
      </section>

      {/* --------------------------------------------------------- neighbours */}
      <nav
        aria-label="Other devices"
        className="shell grid gap-4 border-t border-white/10 py-14 sm:grid-cols-2"
      >
        {[
          { d: prev, dir: "Previous", align: "" },
          { d: next, dir: "Next", align: "sm:text-right sm:items-end" },
        ].map(({ d, dir, align }) => (
          <Link
            key={d.slug}
            href={`/devices/${d.slug}`}
            className={`group flex flex-col gap-2 ${align}`}
          >
            <span className="hud-tight text-[var(--faint)]">{dir}</span>
            <span className="device-name text-3xl text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
              {d.name}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
