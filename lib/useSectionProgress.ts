"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { motionValue, type MotionValue } from "motion/react";

/**
 * How far the page has travelled through a section: 0 when its top meets the
 * viewport top, 1 when its bottom meets the viewport bottom.
 *
 * This is Motion's `useScroll({ target, offset: ["start start", "end end"] })`,
 * written out. Motion's own version reported a progress stuck near zero for a
 * section nested inside the pinned background wrapper, so the measurement is
 * done here where it can be reasoned about: one rect read per scroll event,
 * against the viewport, with no assumptions about which ancestor scrolls.
 *
 * Lenis drives the real scrollTop, so a plain scroll listener sees every frame.
 */
export function useSectionProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMemo(() => motionValue(0), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      if (travel <= 0) {
        progress.set(0);
        return;
      }
      const p = -r.top / travel;
      progress.set(p < 0 ? 0 : p > 1 ? 1 : p);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [ref, progress]);

  return progress;
}
