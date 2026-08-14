"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A grid that warps toward the pointer and ripples where it is clicked.
 *
 * Adapted from the supplied component in three ways it needed to survive as a
 * whole-site ground rather than a demo panel:
 *
 * 1. **It can be the page's ground.** `asLayer` renders the canvas fixed behind
 *    everything with no wrapper, so the app mounts it once instead of nesting
 *    the site inside it.
 * 2. **It costs nothing when nothing is happening.** The loop redraws only
 *    while the pointer is still catching up or a ripple is alive, stops with
 *    the tab, and honours `prefers-reduced-motion` by drawing the resting grid
 *    once. A full-viewport canvas repainting at 60fps behind a scroll-scrubbed
 *    image sequence is a battery bill for an effect nobody is looking at.
 * 3. **It is drawn at device resolution** in the site's own palette. The
 *    original's blue is a demo default; this range is crimson and chrome.
 */

type Point = { x: number; y: number };

type Ripple = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
};

const CELL_SIZE = 78;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 22;
const DOT_SPACING = 34;
const LERP_SPEED = 0.09;

const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.09 };
const NODE_BASE = { r: 255, g: 255, b: 255, a: 0.17 };
const NODE_BASE_RADIUS = 1.1;
const NODE_ACTIVE_RADIUS = 2.6;

/** Pointer within this many px of its target counts as settled. */
const SETTLED = 0.4;

type Rgba = { r: number; g: number; b: number; a: number };

const THEMES = {
  /** The range's own palette: crimson core, hot highlight. */
  crimson: {
    bg: "#050507",
    lineActive: { r: 200, g: 16, b: 46, a: 0.85 } as Rgba,
    nodeActive: { r: 255, g: 59, b: 48, a: 1 } as Rgba,
    glow: "200,16,46",
    ripple: "255,59,48",
  },
  monochrome: {
    bg: "#000000",
    lineActive: { r: 255, g: 255, b: 255, a: 0.9 } as Rgba,
    nodeActive: { r: 255, g: 255, b: 255, a: 1 } as Rgba,
    glow: "255,255,255",
    ripple: "255,255,255",
  },
} as const;

const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

function lerpColor(base: Rgba, active: Rgba, t: number): string {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export default function KineticGrid({
  children,
  className,
  theme = "crimson",
  /** Render as a fixed layer behind the page instead of wrapping children. */
  asLayer = false,
}: {
  children?: ReactNode;
  className?: string;
  theme?: keyof typeof THEMES;
  asLayer?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouse = useRef<Point>({ x: -9999, y: -9999 });
  const target = useRef<Point>({ x: -9999, y: -9999 });
  const ripples = useRef<Ripple[]>([]);
  const raf = useRef(0);
  const size = useRef({ w: 0, h: 0 });
  /** Forces one more frame after the pointer settles, so it lands clean. */
  const dirty = useRef(true);

  const warp = useCallback(
    (gx: number, gy: number, col: number, row: number, cols: number, rows: number) => {
      // Pin the boundary rows and columns so the mesh never peels off its frame.
      const edge = 1.5;
      const colPin = Math.min(col / edge, (cols - 1 - col) / edge, 1);
      const rowPin = Math.min(row / edge, (rows - 1 - row) / edge, 1);
      const pin = colPin * colPin * rowPin * rowPin;

      const m = mouse.current;
      const dx = gx - m.x;
      const dy = gy - m.y;
      const dist = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pin;

      let rx = 0;
      let ry = 0;
      for (const r of ripples.current) {
        const diff = Math.hypot(gx - r.x, gy - r.y) - r.radius;
        const width = 55;
        if (Math.abs(diff) < width) {
          const strength = (1 - Math.abs(diff) / width) * r.opacity * 16 * pin;
          const angle = Math.atan2(gy - r.y, gx - r.x);
          const sign = diff < 0 ? -1 : 1;
          rx -= Math.cos(angle) * strength * sign;
          ry -= Math.sin(angle) * strength * sign;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pin > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const amount = eased * MAX_WARP * pin;
        const angle = Math.atan2(dy, dx);
        return {
          pt: { x: gx - Math.cos(angle) * amount + rx, y: gy - Math.sin(angle) * amount + ry },
          proximity,
        };
      }
      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    [],
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const { w: W, h: H } = size.current;
      const t = THEMES[theme];

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, W, H);

      // Resting dot texture — the paper the grid is drawn on.
      ctx.fillStyle = "rgba(255,255,255,0.042)";
      for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const r = ripples.current[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 420);
        r.opacity = Math.max(0, 1 - age * 1.15);
        if (r.opacity <= 0) ripples.current.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
      const cellW = W / (cols - 1);
      const cellH = H / (rows - 1);

      const pts: Point[][] = [];
      const prox: number[][] = [];
      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = warp(col * cellW, row * cellH, col, row, cols, rows);
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      const seg = (p1: Point, p2: Point, a: number, b: number) => {
        const avg = (a + b) / 2;
        const s = avg * avg * (3 - 2 * avg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, t.lineActive, s);
        ctx.lineWidth = lerpN(0.7, 1.4, s);
        ctx.stroke();
      };

      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          seg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);
      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          seg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const pr = prox[row][col];
          const s = pr * pr * (3 - 2 * pr);
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, s);

          if (s > 0.3) {
            const glowR = r + lerpN(0, 7, (s - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
            grd.addColorStop(0, `rgba(${t.glow},${(s * 0.32).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${t.glow},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(NODE_BASE, t.nodeActive, s);
          ctx.fill();
        }
      }

      for (const r of ripples.current) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${t.ripple},${(r.opacity * 0.24).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    },
    [warp, theme],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const setSize = () => {
      // Capped: past 1.5 the extra pixels are invisible and the fill rate is not.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.current = { w, h };
      dirty.current = true;
    };

    setSize();
    window.addEventListener("resize", setSize);

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      target.current = { x: -9999, y: -9999 };
    };
    const onClick = (e: PointerEvent) => {
      ripples.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };

    if (reduced.matches) {
      draw(performance.now());
      window.addEventListener("resize", () => draw(performance.now()));
      return () => window.removeEventListener("resize", setSize);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const loop = (now: number) => {
      const m = mouse.current;
      const tt = target.current;
      const moving = Math.abs(m.x - tt.x) > SETTLED || Math.abs(m.y - tt.y) > SETTLED;

      if (moving) {
        m.x = lerpN(m.x, tt.x, LERP_SPEED);
        m.y = lerpN(m.y, tt.y, LERP_SPEED);
      }

      // Idle frames are skipped entirely: nothing on screen would change.
      if (moving || ripples.current.length > 0 || dirty.current) {
        draw(now);
        dirty.current = moving || ripples.current.length > 0;
      }

      raf.current = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(loop);
    };
    const stop = () => cancelAnimationFrame(raf.current);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("resize", setSize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [draw]);

  const canvas = (
    <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 h-full w-full" />
  );

  if (asLayer) {
    return (
      <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-0", className)}>
        {canvas}
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-[#050507]", className)}>
      {canvas}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
