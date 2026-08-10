"use client";

import { type ReactNode, useId } from "react";

/*
 * Product photography can't be sourced, so each unit is drawn. Proportions
 * follow the published dimensions where they exist (LINK mini is 84 × 63 × 24,
 * TAG is a disc, DOT a puck, SOLAR carries a panel face). Chrome is a shared
 * gradient vocabulary; the amber LED is the only colour that ever lights up.
 */

type ArtProps = { slug: string; className?: string };

function Shell({
  children,
  gid,
  viewBox = "0 0 200 200",
  className,
}: {
  children: ReactNode;
  gid: string;
  viewBox?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      aria-hidden
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Top face — catches the key light */}
        <linearGradient id={`${gid}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5c646f" />
          <stop offset="38%" stopColor="#2b3038" />
          <stop offset="100%" stopColor="#171a20" />
        </linearGradient>
        {/* Front face — in shadow */}
        <linearGradient id={`${gid}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22262d" />
          <stop offset="100%" stopColor="#0e1015" />
        </linearGradient>
        {/* Side face — darkest */}
        <linearGradient id={`${gid}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1e24" />
          <stop offset="100%" stopColor="#0a0c10" />
        </linearGradient>
        {/* Specular sweep laid over the top face */}
        <linearGradient id={`${gid}-spec`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${gid}-led`}>
          <stop offset="0%" stopColor="#ffd98a" />
          <stop offset="45%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-solar`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c3350" />
          <stop offset="50%" stopColor="#0f1d30" />
          <stop offset="100%" stopColor="#254063" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Contact shadow, so every unit sits on a surface */}
      <ellipse cx="100" cy="176" rx="62" ry="9" fill="#000" opacity="0.5" filter={`url(#${gid}-glow)`} />
      {children}
    </svg>
  );
}

/** Extruded box in a light isometric projection. d = depth, used by most units. */
function Box({
  gid,
  x,
  y,
  w,
  h,
  d = 18,
  r = 6,
}: {
  gid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  d?: number;
  r?: number;
}) {
  return (
    <g>
      {/* side */}
      <path
        d={`M${x + w} ${y + r} L${x + w + d} ${y + r - d * 0.55} L${x + w + d} ${y + h - d * 0.55} L${x + w} ${y + h}Z`}
        fill={`url(#${gid}-side)`}
      />
      {/* top */}
      <path
        d={`M${x} ${y + r} L${x + d} ${y + r - d * 0.55} L${x + w + d} ${y + r - d * 0.55} L${x + w} ${y + r}Z`}
        fill={`url(#${gid}-top)`}
      />
      {/* front */}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${gid}-front)`} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill="none"
        stroke="#7f8b99"
        strokeOpacity="0.34"
      />
      {/* specular sweep across the face */}
      <rect x={x} y={y} width={w} height={h * 0.5} rx={r} fill={`url(#${gid}-spec)`} opacity="0.5" />
    </g>
  );
}

function Led({ gid, cx, cy }: { gid: string; cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill={`url(#${gid}-led)`} opacity="0.85" />
      <circle cx={cx} cy={cy} r="2.4" fill="#ffe4ad" />
    </g>
  );
}

/** Cable leaving the unit — marks the wired classes at a glance. */
function Cable({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke="#0a0c10" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#39414c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#8d99a8" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

function Grille({ x, y, rows, cols, gap = 8 }: { x: number; y: number; rows: number; cols: number; gap?: number }) {
  const dots = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      dots.push(
        <circle key={`${r}-${c}`} cx={x + c * gap} cy={y + r * gap} r="1.3" fill="#6e7a89" opacity="0.5" />,
      );
  return <g>{dots}</g>;
}

export default function DeviceArt({ slug, className }: ArtProps) {
  const gid = useId().replace(/:/g, "");

  switch (slug) {
    /* ------------------------------------------------ CORE — the CAN bus box */
    case "core":
      return (
        <Shell gid={gid} className={className}>
          <Cable d="M62 132 C 30 140, 24 158, 40 170" />
          <Cable d="M138 132 C 172 140, 178 158, 162 170" />
          <Box gid={gid} x={54} y={62} w={92} h={78} d={20} r={7} />
          {/* connector bank — CORE's defining feature */}
          <rect x={62} y={122} width={76} height={11} rx={3} fill="#05070a" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={66 + i * 12} y={125} width={7} height={5} rx={1} fill="#8d99a8" opacity="0.7" />
          ))}
          <Grille x={70} y={80} rows={2} cols={4} />
          <Led gid={gid} cx={130} cy={82} />
          <text x={68} y={110} fill="#98a4b3" fontSize="9" letterSpacing="2.4" opacity="0.75">
            CORE
          </text>
        </Shell>
      );

    /* ------------------------------------------- EDGE — plug-and-play, larger */
    case "edge":
      return (
        <Shell gid={gid} className={className}>
          <Cable d="M100 142 C 100 162, 86 168, 68 172" />
          <Box gid={gid} x={50} y={54} w={100} h={88} d={22} r={8} />
          <rect x={84} y={136} width={32} height={12} rx={3} fill="#05070a" />
          <rect x={90} y={139} width={20} height={6} rx={1.5} fill="#8d99a8" opacity="0.6" />
          <rect x={62} y={70} width={76} height={40} rx={4} fill="#05070a" opacity="0.55" />
          <Grille x={70} y={80} rows={3} cols={7} gap={9} />
          <Led gid={gid} cx={132} cy={126} />
          <text x={62} y={126} fill="#98a4b3" fontSize="9" letterSpacing="2.4" opacity="0.75">
            EDGE
          </text>
        </Shell>
      );

    /* ------------------------------------------------ LITE — small, one cable */
    case "lite":
      return (
        <Shell gid={gid} className={className}>
          <Cable d="M100 136 C 100 156, 120 162, 140 166" />
          <Box gid={gid} x={66} y={78} w={68} h={58} d={16} r={16} />
          <Led gid={gid} cx={100} cy={98} />
          <rect x={80} y={116} width={40} height={1.2} fill="#6e7a89" opacity="0.5" />
          <text x={80} y={112} fill="#98a4b3" fontSize="8" letterSpacing="2.2" opacity="0.75">
            LITE
          </text>
        </Shell>
      );

    /* ------------------------------------------ OBD — the trapezoid connector */
    case "obd":
      return (
        <Shell gid={gid} className={className}>
          <Box gid={gid} x={62} y={62} w={76} h={56} d={18} r={8} />
          {/* OBD-II housing: the recognisable D-shape */}
          <path
            d="M74 118 L126 118 L132 150 L68 150 Z"
            fill={`url(#${gid}-front)`}
            stroke="#7f8b99"
            strokeOpacity="0.34"
          />
          <path d="M78 126 L122 126 L126 142 L74 142 Z" fill="#05070a" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={80 + i * 5.4} y={129} width={3} height={4} rx={0.6} fill="#c9a24a" opacity="0.85" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={`b${i}`} x={80 + i * 5.4} y={136} width={3} height={4} rx={0.6} fill="#c9a24a" opacity="0.6" />
          ))}
          <Led gid={gid} cx={126} cy={76} />
          <text x={72} y={102} fill="#98a4b3" fontSize="9" letterSpacing="2.4" opacity="0.75">
            OBD
          </text>
        </Shell>
      );

    /* -------------------------------------- LINK — sealed, no cable, antenna */
    case "link":
      return (
        <Shell gid={gid} className={className}>
          <Box gid={gid} x={58} y={64} w={84} h={76} d={20} r={20} />
          {/* mounting lugs — it straps to an attachment */}
          <circle cx={68} cy={74} r="3.4" fill="#05070a" />
          <circle cx={132} cy={74} r="3.4" fill="#05070a" />
          <circle cx={68} cy={130} r="3.4" fill="#05070a" />
          <circle cx={132} cy={130} r="3.4" fill="#05070a" />
          {/* radio waves — LTE-M + NB-IoT */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M100 ${58 - i * 9} m-${14 + i * 10} 0 a ${14 + i * 10} ${9 + i * 6} 0 0 1 ${28 + i * 20} 0`}
              stroke="var(--accent)"
              strokeWidth="1.4"
              opacity={0.5 - i * 0.14}
              fill="none"
            />
          ))}
          <Led gid={gid} cx={100} cy={92} />
          <text x={80} y={122} fill="#98a4b3" fontSize="9" letterSpacing="2.4" opacity="0.75">
            LINK
          </text>
        </Shell>
      );

    /* ------------------- LINK mini — 84 × 63 × 24 mm, held to that proportion */
    case "link-mini":
      return (
        <Shell gid={gid} className={className}>
          <Box gid={gid} x={68} y={82} w={64} h={48} d={14} r={12} />
          <circle cx={78} cy={92} r="2.6" fill="#05070a" />
          <circle cx={122} cy={92} r="2.6" fill="#05070a" />
          <Led gid={gid} cx={100} cy={106} />
          <text x={80} y={124} fill="#98a4b3" fontSize="7" letterSpacing="1.8" opacity="0.75">
            LINK mini
          </text>
          {/* dimension callout — the spec is the story here */}
          <g opacity="0.5">
            <path d="M68 140 L132 140" stroke="#6e7a89" strokeWidth="0.8" />
            <path d="M68 137 L68 143 M132 137 L132 143" stroke="#6e7a89" strokeWidth="0.8" />
            <text x={100} y={152} fill="#8d99a8" fontSize="7" textAnchor="middle" letterSpacing="1.2">
              84 mm
            </text>
          </g>
        </Shell>
      );

    /* --------------------------------------------- VOLT — long-life, elongated */
    case "volt":
      return (
        <Shell gid={gid} className={className}>
          <Box gid={gid} x={44} y={82} w={112} h={54} d={18} r={14} />
          {/* battery cell segments — five years of them */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={54 + i * 20}
              y={94}
              width={13}
              height={18}
              rx={2}
              fill="var(--accent)"
              opacity={0.16 + i * 0.13}
            />
          ))}
          <Led gid={gid} cx={140} cy={124} />
          <text x={54} y={128} fill="#98a4b3" fontSize="9" letterSpacing="2.4" opacity="0.75">
            VOLT
          </text>
        </Shell>
      );

    /* ------------------------------------------------------- DOT — a BLE puck */
    case "dot":
      return (
        <Shell gid={gid} className={className}>
          {/* puck body: an ellipse extruded downward */}
          <path d="M52 108 L52 122 A48 20 0 0 0 148 122 L148 108Z" fill={`url(#${gid}-side)`} />
          <ellipse cx={100} cy={108} rx={48} ry={20} fill={`url(#${gid}-top)`} />
          <ellipse cx={100} cy={108} rx={48} ry={20} fill="none" stroke="#7f8b99" strokeOpacity="0.34" />
          <ellipse cx={100} cy={106} rx={34} ry={13} fill="#05070a" opacity="0.5" />
          {/* bluetooth advertisement pings */}
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={100}
              cy={108}
              rx={54 + i * 16}
              ry={22 + i * 7}
              stroke="var(--signal)"
              strokeWidth="1.1"
              opacity={0.34 - i * 0.1}
              fill="none"
            />
          ))}
          <Led gid={gid} cx={100} cy={104} />
          <text x={100} y={140} fill="#98a4b3" fontSize="9" letterSpacing="2.6" textAnchor="middle" opacity="0.75">
            DOT
          </text>
        </Shell>
      );

    /* ------------------------------------------- SOLAR — panel face, sun above */
    case "solar":
      return (
        <Shell gid={gid} className={className}>
          <Box gid={gid} x={54} y={96} w={92} h={44} d={18} r={7} />
          {/* the panel, angled on top */}
          <path
            d="M48 96 L72 66 L164 66 L140 96 Z"
            fill={`url(#${gid}-solar)`}
            stroke="#7f8b99"
            strokeOpacity="0.34"
          />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${56 + i * 24} 96 L${80 + i * 24} 66`}
              stroke="#5f7fa6"
              strokeWidth="0.9"
              opacity="0.5"
            />
          ))}
          <path d="M52 84 L152 84" stroke="#5f7fa6" strokeWidth="0.9" opacity="0.4" />
          {/* incoming light */}
          {[0, 1, 2].map((i) => (
            <path
              key={`r${i}`}
              d={`M${86 + i * 26} ${34 + i * 3} L${94 + i * 26} ${56 + i * 3}`}
              stroke="var(--accent)"
              strokeWidth="1.3"
              opacity={0.55 - i * 0.12}
            />
          ))}
          <Led gid={gid} cx={132} cy={126} />
          <text x={64} y={126} fill="#98a4b3" fontSize="9" letterSpacing="2.4" opacity="0.75">
            SOLAR
          </text>
        </Shell>
      );

    /* ------------------------------------------- TAG — passive disc, QR + NFC */
    case "tag":
      return (
        <Shell gid={gid} className={className}>
          <circle cx={100} cy={104} r="52" fill={`url(#${gid}-front)`} stroke="#7f8b99" strokeOpacity="0.34" />
          <circle cx={100} cy={104} r="52" fill={`url(#${gid}-spec)`} opacity="0.35" />
          <circle cx={100} cy={104} r="42" fill="none" stroke="#6e7a89" strokeOpacity="0.3" strokeDasharray="2 5" />
          {/* a real QR-ish finder pattern */}
          <g transform="translate(78,82)">
            <rect width="44" height="44" fill="#05070a" rx="3" />
            {[
              [3, 3],
              [29, 3],
              [3, 29],
            ].map(([x, y], i) => (
              <g key={i}>
                <rect x={x} y={y} width="12" height="12" fill="#c3cbd6" />
                <rect x={x + 3} y={y + 3} width="6" height="6" fill="#05070a" />
              </g>
            ))}
            {[
              [20, 20],
              [26, 20],
              [20, 26],
              [32, 26],
              [26, 32],
              [20, 38],
              [38, 20],
              [32, 38],
            ].map(([x, y], i) => (
              <rect key={`d${i}`} x={x} y={y} width="4" height="4" fill="#c3cbd6" opacity="0.85" />
            ))}
          </g>
          {/* NFC field */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M158 ${88 + i * 4} a ${18 + i * 9} ${18 + i * 9} 0 0 1 0 ${32 - i * 8}`}
              stroke="var(--signal)"
              strokeWidth="1.3"
              opacity={0.5 - i * 0.13}
              fill="none"
            />
          ))}
          <text x={100} y={172} fill="#98a4b3" fontSize="9" letterSpacing="2.6" textAnchor="middle" opacity="0.75">
            TAG
          </text>
        </Shell>
      );

    default:
      return (
        <Shell gid={gid} className={className}>
          <Box gid={gid} x={62} y={72} w={76} h={64} d={18} r={8} />
        </Shell>
      );
  }
}
