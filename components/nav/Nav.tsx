"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReduced } from "@/lib/useReduced";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { devices, GROUPS } from "@/lib/devices";
import { EASE, SPRING } from "@/lib/motion";
import Mark from "./Mark";
import DeviceArt from "@/components/device-art/DeviceArt";

const SECTIONS = [
  { id: "showroom", label: "Devices" },
  { id: "rail", label: "Classes" },
  { id: "index", label: "Index" },
];

/** Closed pill geometry — the panel's clip-path starts life exactly here. */
const PILL_W = 128;
const PILL_H = 40;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("showroom");
  const [hidden, setHidden] = useState(false);
  const [dim, setDim] = useState(false);
  const [panel, setPanel] = useState({ w: 620, h: 660 });
  const [preview, setPreview] = useState<string | null>(null);

  const reduced = useReduced();
  const { scrollY, scrollYProgress } = useScroll();
  /* Eased, so the progress hairline glides instead of tracking every wheel tick. */
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const lastY = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Panel size is measured, not guessed, so the clip-path morph is exact. */
  useEffect(() => {
    const measure = () =>
      setPanel({
        w: Math.min(660, window.innerWidth - 32),
        h: Math.min(680, window.innerHeight - 128),
      });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* The bar recedes while scrolling and returns on idle. */
  useMotionValueEvent(scrollY, "change", (y) => {
    setHidden(y > 220 && y > lastY.current && !open);
    lastY.current = y;
    setDim(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setDim(false), 420);
  });

  /* Which section owns the viewport. */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  /* Escape closes; body locks while open. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  /*
   * The morph: one panel, clipped down to the pill's exact rectangle when
   * closed and released to full size when open. Because both states are plain
   * pixel insets, the corner radius and both dimensions interpolate together —
   * the pill genuinely becomes the panel rather than cross-fading into it.
   */
  const clipClosed = `inset(0px 0px ${panel.h - PILL_H}px ${panel.w - PILL_W}px round 999px)`;
  const clipOpen = `inset(0px 0px 0px 0px round 26px)`;

  return (
    <>
      {/* ---------------------------------------------------------------- bar */}
      {/* Sits above the panel (z-80) so Close stays reachable once it opens. */}
      <motion.header
        className="fixed inset-x-0 top-0 z-[85]"
        initial={false}
        animate={{
          y: hidden ? -96 : 0,
          opacity: open ? 1 : dim && !hidden ? 0.62 : 1,
        }}
        transition={reduced ? { duration: 0 } : SPRING.panel}
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between">
          {/* wordmark */}
          <Link
            href="/"
            className="hud-tight text-[var(--text)] link-underline transition-opacity duration-300"
            style={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : undefined }}
            onClick={close}
          >
            syniotec
            <span className="ml-2 text-[var(--faint)]">/ devices</span>
          </Link>

          {/* the dark tab, hanging from the top edge */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 transition-opacity duration-300"
            style={{ opacity: open ? 0 : 1 }}
          >
            <div className="flex h-[62px] w-[58px] items-end justify-center bg-[#101216] pb-3 text-[var(--text)] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]">
              <Mark />
            </div>
          </div>

          <div className="flex items-center gap-7">
            {/* inline section links with a sliding indicator */}
            <nav
              className="hidden items-center gap-1 transition-opacity duration-300 md:flex"
              style={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : undefined }}
              aria-hidden={open}
              aria-label="Sections"
            >
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="relative rounded-full px-3.5 py-2"
                  aria-current={active === s.id ? "true" : undefined}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full bg-white/10"
                      style={{
                        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.18)",
                      }}
                      transition={reduced ? { duration: 0 } : SPRING.snap}
                    />
                  )}
                  <span
                    className="hud-tight relative z-10"
                    style={{ color: active === s.id ? "var(--text)" : undefined }}
                  >
                    {s.label}
                  </span>
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="device-index-panel"
              className="hud flex items-center gap-3 text-[var(--text)]"
              style={{ height: PILL_H, minWidth: PILL_W, justifyContent: "flex-end" }}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span className="relative block h-[1px] w-7 bg-current">
                <motion.span
                  className="absolute inset-0 block bg-[var(--accent)]"
                  animate={{ scaleX: open ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* how far down the page you are — a hairline under the bar */}
        <motion.div
          aria-hidden
          className="h-px origin-left bg-[var(--accent)]"
          style={{ scaleX: reduced ? 0 : progress }}
        />
      </motion.header>

      {/* ------------------------------------------------------------ scrim */}
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close menu"
            className="fixed inset-0 z-[75] bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- panel */}
      <div
        className="pointer-events-none fixed right-4 top-[18px] z-[80]"
        style={{ filter: reduced ? undefined : "url(#goo)" }}
      >
        <motion.div
          id="device-index-panel"
          className="glass rim overflow-hidden"
          style={{
            width: panel.w,
            height: panel.h,
            /* Collapsed, the panel still covers the Menu button — clipped and
               invisible, but it would otherwise swallow the click. */
            pointerEvents: open ? "auto" : "none",
          }}
          initial={false}
          animate={{
            clipPath: open ? clipOpen : clipClosed,
            opacity: open ? 1 : 0,
          }}
          transition={
            reduced
              ? { duration: 0 }
              : { ...SPRING.panel, opacity: { duration: 0.18 } }
          }
          aria-hidden={!open}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                className="flex h-full flex-col p-7"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.42, ease: EASE, delay: 0.1 }}
              >
                <div className="mb-5 flex items-baseline justify-between border-b border-white/10 pb-4">
                  <span className="hud">Device index</span>
                  <span className="hud text-[var(--faint)]">
                    {String(devices.length).padStart(3, "0")} units
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 gap-6">
                  {/* the list */}
                  <div className="min-w-0 flex-1 overflow-y-auto pr-1">
                    {GROUPS.map((g) => (
                      <div key={g.id} className="mb-4 last:mb-0">
                        <p className="hud-tight mb-2 text-[var(--faint)]">{g.label}</p>
                        {devices
                          .filter((d) => d.group === g.id)
                          .map((d, i) => (
                            <motion.div
                              key={d.slug}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.5,
                                ease: EASE,
                                delay: 0.16 + i * 0.045,
                              }}
                            >
                              <Link
                                href={`/devices/${d.slug}`}
                                onClick={close}
                                onMouseEnter={() => setPreview(d.slug)}
                                onFocus={() => setPreview(d.slug)}
                                className="group flex items-baseline gap-3 border-b border-white/[0.06] py-2 transition-colors hover:border-[var(--accent)]/40"
                              >
                                <span className="hud-tight w-8 shrink-0 text-[var(--faint)] transition-colors group-hover:text-[var(--accent)]">
                                  {d.index}
                                </span>
                                <span className="device-name flex-1 truncate text-lg text-[var(--text)]">
                                  {d.name}
                                </span>
                                <span className="hud-tight hidden shrink-0 text-[var(--faint)] sm:block">
                                  {d.metric.value}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                      </div>
                    ))}
                  </div>

                  {/* hover preview */}
                  <div className="hidden w-[190px] shrink-0 flex-col justify-between border-l border-white/10 pl-5 sm:flex">
                    <div className="relative h-[190px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={preview ?? "none"}
                          className="absolute inset-0 grid place-items-center"
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.04 }}
                          transition={{ duration: 0.32, ease: EASE }}
                        >
                          {preview ? (
                            <DeviceArt slug={preview} className="h-full w-full" />
                          ) : (
                            <span className="hud text-center text-[var(--faint)]">
                              Hover
                              <br />a unit
                            </span>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <p className="hud-tight leading-relaxed text-[var(--faint)]">
                      Seven units. Wired, self-powered, or off the grid entirely.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* -------------------------------------------- right-edge section counter */}
      <div className="pointer-events-none fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 lg:block">
        <div className="flex flex-col items-center gap-3">
          {SECTIONS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-3">
              <span
                className="hud-tight transition-colors duration-500"
                style={{
                  color: active === s.id ? "var(--accent)" : "var(--faint)",
                  writingMode: "vertical-rl",
                  letterSpacing: "0.3em",
                }}
              >
                {String(i + 1).padStart(3, "0")}
              </span>
              {i < SECTIONS.length - 1 && <span className="h-8 w-px bg-white/15" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
