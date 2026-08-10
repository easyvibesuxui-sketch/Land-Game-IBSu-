"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { useReduced } from "@/lib/useReduced";

/**
 * Assembly is expressed as one CSS custom property, `--a`, on the art's root:
 * 0 = fully exploded, 1 = assembled. Every part reads it from a static
 * transform expression, so a single property write drives the whole device and
 * the transforms stay on the compositor.
 *
 * `--a` defaults to 1 in CSS. With no JS, no observer, or reduced motion the
 * devices simply render assembled — the animation is purely additive, and
 * nothing can leave a device stuck in pieces.
 */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Continuous scrub. For a single device that owns the viewport — the detail
 * page hero — where the assembly *is* the scroll.
 */
export function useAssemblyScrub(
  target: RefObject<SVGElement | HTMLElement | null>,
  progress: MotionValue<number>,
  /** Assembly completes at this fraction of the scroll range. */
  completeAt = 0.7,
) {
  const reduced = useReduced();

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    if (reduced) {
      el.style.setProperty("--a", "1");
      return;
    }

    const apply = (p: number) => {
      el.style.setProperty("--a", clamp01(p / completeAt).toFixed(4));
    };

    apply(progress.get());
    return progress.on("change", apply);
  }, [target, progress, completeAt, reduced]);
}

/**
 * One-shot on enter, handed to CSS to interpolate. Used by the showroom grid:
 * ten devices scrubbing per frame would burn budget for an effect nobody can
 * follow ten times at once, whereas flipping one property and letting the
 * compositor run a staggered transition costs nothing after the flip.
 */
export function useAssemblyOnEnter<T extends SVGElement | HTMLElement>(
  /** Delay before the parts start converging, in ms. */
  delay = 0,
) {
  const ref = useRef<T>(null);
  const reduced = useReduced();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.setProperty("--a", "1");
      return;
    }

    // Start exploded only once we know we can animate it back together.
    el.style.setProperty("--a", "0");
    el.dataset.assembling = "true";

    let timer: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          timer = setTimeout(() => el.style.setProperty("--a", "1"), delay);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.25 },
    );
    obs.observe(el);

    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [delay, reduced]);

  return ref;
}
