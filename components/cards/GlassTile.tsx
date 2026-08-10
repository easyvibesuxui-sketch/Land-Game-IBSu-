"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReduced } from "@/lib/useReduced";
import { SPRING } from "@/lib/motion";
import type { Device } from "@/lib/devices";

export type Shape = Device["shape"];

const SHAPE_CLASS: Record<Shape, string> = {
  arch: "shape-arch",
  capsule: "shape-capsule",
  wide: "shape-wide",
  tall: "shape-tall",
  squircle: "shape-squircle",
  beveled: "shape-beveled",
  circle: "shape-circle",
};

type Props = {
  children: ReactNode;
  shape?: Shape;
  className?: string;
  /** Adds the displacement-map refraction layer. Costly — reserve for hero tiles. */
  refract?: boolean;
  /** Degrees of pointer tilt. 0 disables. */
  tilt?: number;
};

/**
 * The liquid-glass primitive. Shape-agnostic: the caller picks the silhouette,
 * this supplies the material — refraction, tint, a pointer-tracked specular
 * rim, and inner bloom.
 */
export default function GlassTile({
  children,
  shape = "wide",
  className = "",
  refract = false,
  tilt = 6,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING.follow);
  const sy = useSpring(py, SPRING.follow);

  const rotateY = useTransform(sx, [0, 1], [-tilt, tilt]);
  const rotateX = useTransform(sy, [0, 1], [tilt, -tilt]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx);
    py.set(ny);
    el.style.setProperty("--mx", `${nx * 100}%`);
    el.style.setProperty("--my", `${ny * 100}%`);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={reduced ? undefined : onMove}
      onMouseLeave={reduced ? undefined : reset}
      className={`glass rim ${refract ? "glass-refract" : ""} ${SHAPE_CLASS[shape]} ${className}`}
      style={
        reduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1100,
              transformStyle: "preserve-3d",
            }
      }
    >
      {children}
    </motion.div>
  );
}
