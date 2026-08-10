"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** The server can't know the preference, so it always renders the full version. */
const getServerSnapshot = () => false;

/**
 * Hydration-safe reduced-motion flag.
 *
 * Motion's own hook reads the media query during the first client render, so a
 * component that branches its markup on it renders one tree on the server and a
 * different one in the browser — React throws a hydration mismatch, and any
 * `useScroll` target inside the discarded branch reports an unhydrated ref.
 *
 * useSyncExternalStore hydrates against the server snapshot and then re-renders
 * with the real preference, which is exactly the handoff we need.
 */
export function useReduced(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
