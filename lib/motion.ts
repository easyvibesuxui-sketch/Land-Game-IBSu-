import type { Transition } from "motion/react";

/** One spring vocabulary for the whole site, so every surface feels like one system. */
export const SPRING = {
  /** The nav indicator and anything that must feel snapped-to. */
  snap: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
  /** Panels opening and closing — heavier, more deliberate. */
  panel: { type: "spring", stiffness: 210, damping: 30, mass: 1 },
  /** Cursor-following highlights and tilts. */
  follow: { type: "spring", stiffness: 150, damping: 20, mass: 0.5 },
} satisfies Record<string, Transition>;

/** Long cinematic easing, matched to the reference's slow camera moves. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const REVEAL: Transition = { duration: 1.1, ease: EASE };

/** Parallax depths. Higher = travels further = reads as closer to the camera. */
export const DEPTH = {
  backdrop: -60,
  glow: -30,
  midground: 40,
  subject: 90,
  foreground: 160,
} as const;

export const stagger = (i: number, step = 0.06) => ({
  ...REVEAL,
  delay: i * step,
});
