"use client";

import { useRef, type ReactNode } from "react";
import { useReduced } from "@/lib/useReduced";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

type Props = {
  children: ReactNode;
  /** Travel in px across the element's full pass through the viewport. Negative = slower than scroll. */
  depth?: number;
  /** Scale at the end of the pass. 1 = none. */
  zoom?: number;
  className?: string;
  /** Damp the travel so it trails the scroll slightly. */
  damped?: boolean;
};

export default function Parallax({
  children,
  depth = 60,
  zoom = 1,
  className,
  damped = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothed = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const progress = damped ? smoothed : scrollYProgress;

  const y = useTransform(progress, [0, 1], [depth, -depth]);
  const scale = useTransform(progress, [0, 1], [1, zoom]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y, scale, willChange: "transform" }}>
      {children}
    </motion.div>
  );
}
