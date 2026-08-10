"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { EASE } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Wipes up from under a mask — the line arrives rather than fading in.
 *
 * Deliberately a plain motion.span: building the motion component from a tag
 * prop would mint a new component type on every render, remounting the child
 * and resetting it to its `initial` state forever.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduced = useReduced();
  const wrapper = useRef<HTMLSpanElement>(null);

  /*
   * The visibility check has to watch the wrapper, not the animated child.
   * The child starts translated fully below the wrapper's overflow:hidden box,
   * and IntersectionObserver honours ancestor clipping — so an inline
   * whileInView on the child would report "never visible" and deadlock at its
   * initial state.
   */
  const inView = useInView(wrapper, { once: true, margin: "-12% 0px" });

  if (reduced) return <span className={className}>{children}</span>;

  return (
    /*
     * The display face has a 0.92 line-height, so descenders and overshoot sit
     * outside the line box. Pad the mask and pull it back with a negative
     * margin, or overflow:hidden shears the bottom off every line.
     */
    <span
      ref={wrapper}
      style={{
        display: "block",
        overflow: "hidden",
        paddingBottom: "0.16em",
        marginBottom: "-0.16em",
      }}
    >
      <motion.span
        className={className}
        style={{ display: "block" }}
        initial={{ y: "108%", opacity: 0 }}
        animate={inView ? { y: "0%", opacity: 1 } : { y: "108%", opacity: 0 }}
        transition={{ duration: 1.15, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Splits a headline into lines, each wiping in behind the last. */
export function RevealLines({
  lines,
  className,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className} style={{ display: "block" }}>
      {lines.map((line, i) => (
        <Reveal key={line + i} delay={delay + i * 0.09}>
          <span style={{ display: "block" }}>{line}</span>
        </Reveal>
      ))}
    </span>
  );
}

/** Generic fade-and-rise for supporting copy and tiles. */
export function FadeUp({
  children,
  delay = 0,
  className,
  distance = 26,
}: RevealProps & { distance?: number }) {
  const reduced = useReduced();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ y: distance, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.95, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
