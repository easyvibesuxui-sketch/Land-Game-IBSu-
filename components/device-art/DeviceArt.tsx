"use client";

import { type CSSProperties, type ReactNode, type Ref, useId } from "react";

import { bySlug } from "@/lib/devices";

/*
 * Product photography can't be sourced, so each unit is drawn. Proportions
 * follow the published dimensions where they exist (LINK mini is 84 × 63 × 24,
 * TAG is a disc, DOT a puck, SOLAR carries a panel face). Chrome is a shared
 * gradient vocabulary; the red LED is the only colour that ever lights up.
 *
 * Every element sits inside a <Part>, which carries the displacement it takes
 * when the device is exploded. See `useAssembly.ts` and the .device-part rules
 * in globals.css for how the single `--a` property drives them all.
 */

type ArtProps = {
  slug: string;
  className?: string;
  style?: CSSProperties;
  /** Handed to the <svg> so a driver can write `--a` on it. React 19 takes ref as a plain prop. */
  ref?: Ref<SVGSVGElement>;
};

/**
 * One displaceable piece. `dx`/`dy` are its offset in viewBox units when fully
 * exploded, `rot` its tilt, and `i` its place in the assembly stagger — lower
 * indices settle first, so a device knits together from its core outward.
 */
function Part({
  children,
  dx = 0,
  dy = 0,
  rot = 0,
  i = 0,
}: {
  children: ReactNode;
  dx?: number;
  dy?: number;
  rot?: number;
  i?: number;
}) {
  return (
    <g
      className="device-part"
      style={
        {
          "--ex": dx,
          "--ey": dy,
          "--er": rot,
          "--pi": i,
        } as CSSProperties
      }
    >
      {children}
    </g>
  );
}

function Shell({
  children,
  gid,
  viewBox = "0 0 200 200",
  className,
  style,
  svgRef,
  photo,
}: {
  children: ReactNode;
  gid: string;
  viewBox?: string;
  className?: string;
  style?: CSSProperties;
  svgRef?: Ref<SVGSVGElement>;
  /** Product photograph for this device, if one has been supplied. */
  photo?: string;
}) {
  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={`device-art ${className ?? ""}`}
      style={style}
      fill="none"
      aria-hidden
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
          <stop offset="0%" stopColor="#ffd9d4" />
          <stop offset="45%" stopColor="var(--accent-hot)" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2c333d" />
          <stop offset="50%" stopColor="#161a20" />
          <stop offset="100%" stopColor="#39424e" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Contact shadow, so every unit sits on a surface */}
      <ellipse cx="100" cy="176" rx="62" ry="9" fill="#000" opacity="0.5" filter={`url(#${gid}-glow)`} />

      {photo ? (
        <>
          {/* The drawing carries the exploded state and steps aside as it assembles. */}
          <g className="device-drawn">{children}</g>
          <image
            className="device-photo"
            href={photo}
            x="14"
            y="14"
            width="172"
            height="150"
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      ) : (
        children
      )}
    </svg>
  );
}

/* The extruded back of a box — the shell that lifts away from the face plate. */
function BoxShell({
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
    <>
      <path
        d={`M${x + w} ${y + r} L${x + w + d} ${y + r - d * 0.55} L${x + w + d} ${y + h - d * 0.55} L${x + w} ${y + h}Z`}
        fill={`url(#${gid}-side)`}
      />
      <path
        d={`M${x} ${y + r} L${x + d} ${y + r - d * 0.55} L${x + w + d} ${y + r - d * 0.55} L${x + w} ${y + r}Z`}
        fill={`url(#${gid}-top)`}
      />
    </>
  );
}

/* The front plate of a box. Anchors most devices — the piece everything returns to. */
function BoxFace({
  gid,
  x,
  y,
  w,
  h,
  r = 6,
}: {
  gid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
}) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${gid}-front)`} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke="#7f8b99" strokeOpacity="0.34" />
      <rect x={x} y={y} width={w} height={h * 0.5} rx={r} fill={`url(#${gid}-spec)`} opacity="0.5" />
    </>
  );
}

function Led({ gid, cx, cy }: { gid: string; cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="9" fill={`url(#${gid}-led)`} opacity="0.85" />
      <circle cx={cx} cy={cy} r="2.4" fill="#fff0ee" />
    </>
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
  return <>{dots}</>;
}

const LABEL = { fill: "#98a4b3", fontSize: 9, letterSpacing: 2.4, opacity: 0.75 } as const;

export default function DeviceArt({ slug, className, style, ref }: ArtProps) {
  const gid = useId().replace(/:/g, "");

  /* Identical for every device — kept in one place so the shell can gain props
     (the photograph, most recently) without touching all ten drawings. */
  const shell = {
    gid,
    className,
    style,
    svgRef: ref,
    photo: bySlug(slug)?.photo,
  };

  switch (slug) {
    /* ------------------------------------------------ CORE — the CAN bus box */
    case "core":
      return (
        <Shell {...shell}>
          <Part i={6} dx={-34} dy={30} rot={-12}>
            <Cable d="M62 132 C 30 140, 24 158, 40 170" />
          </Part>
          <Part i={6} dx={34} dy={30} rot={12}>
            <Cable d="M138 132 C 172 140, 178 158, 162 170" />
          </Part>
          <Part i={1} dx={26} dy={-34} rot={-6}>
            <BoxShell gid={gid} x={54} y={62} w={92} h={78} d={20} r={7} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={54} y={62} w={92} h={78} r={7} />
          </Part>
          {/* connector bank — CORE's defining feature, drops straight out */}
          <Part i={4} dy={44}>
            <rect x={62} y={122} width={76} height={11} rx={3} fill="#05070a" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={66 + i * 12} y={125} width={7} height={5} rx={1} fill="#8d99a8" opacity="0.7" />
            ))}
          </Part>
          <Part i={3} dx={-40} dy={-16}>
            <Grille x={70} y={80} rows={2} cols={4} />
          </Part>
          <Part i={2} dx={30} dy={-24}>
            <Led gid={gid} cx={130} cy={82} />
          </Part>
          <Part i={5} dx={-24} dy={16}>
            <text x={68} y={110} {...LABEL}>
              CORE
            </text>
          </Part>
        </Shell>
      );

    /* ------------------------------------------- EDGE — plug-and-play, larger */
    case "edge":
      return (
        <Shell {...shell}>
          <Part i={5} dx={-30} dy={34} rot={14}>
            <Cable d="M100 142 C 100 162, 86 168, 68 172" />
          </Part>
          <Part i={1} dx={28} dy={-38} rot={-7}>
            <BoxShell gid={gid} x={50} y={54} w={100} h={88} d={22} r={8} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={50} y={54} w={100} h={88} r={8} />
          </Part>
          <Part i={4} dy={40}>
            <rect x={84} y={136} width={32} height={12} rx={3} fill="#05070a" />
            <rect x={90} y={139} width={20} height={6} rx={1.5} fill="#8d99a8" opacity="0.6" />
          </Part>
          <Part i={2} dx={-16} dy={-30}>
            <rect x={62} y={70} width={76} height={40} rx={4} fill="#05070a" opacity="0.55" />
            <Grille x={70} y={80} rows={3} cols={7} gap={9} />
          </Part>
          <Part i={3} dx={34} dy={18}>
            <Led gid={gid} cx={132} cy={126} />
          </Part>
          <Part i={5} dx={-28} dy={14}>
            <text x={62} y={126} {...LABEL}>
              EDGE
            </text>
          </Part>
        </Shell>
      );

    /* ------------------------------------------------ LITE — small, one cable */
    case "lite":
      return (
        <Shell {...shell}>
          <Part i={4} dx={36} dy={26} rot={16}>
            <Cable d="M100 136 C 100 156, 120 162, 140 166" />
          </Part>
          <Part i={1} dx={22} dy={-32} rot={-8}>
            <BoxShell gid={gid} x={66} y={78} w={68} h={58} d={16} r={16} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={66} y={78} w={68} h={58} r={16} />
          </Part>
          <Part i={2} dy={-34}>
            <Led gid={gid} cx={100} cy={98} />
          </Part>
          <Part i={3} dx={-30} dy={20}>
            <rect x={80} y={116} width={40} height={1.2} fill="#6e7a89" opacity="0.5" />
            <text x={80} y={112} {...LABEL} fontSize={8} letterSpacing={2.2}>
              LITE
            </text>
          </Part>
        </Shell>
      );

    /* ------------------------------------------ OBD — the trapezoid connector */
    case "obd":
      return (
        <Shell {...shell}>
          <Part i={1} dx={24} dy={-34} rot={-8}>
            <BoxShell gid={gid} x={62} y={62} w={76} h={56} d={18} r={8} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={62} y={62} w={76} h={56} r={8} />
          </Part>
          {/* OBD-II housing: the recognisable D-shape, unplugging downward */}
          <Part i={4} dy={48}>
            <path
              d="M74 118 L126 118 L132 150 L68 150 Z"
              fill={`url(#${gid}-front)`}
              stroke="#7f8b99"
              strokeOpacity="0.34"
            />
            <path d="M78 126 L122 126 L126 142 L74 142 Z" fill="#05070a" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={i} x={80 + i * 5.4} y={129} width={3} height={4} rx={0.6} fill="#c3cbd6" opacity="0.85" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={`b${i}`} x={80 + i * 5.4} y={136} width={3} height={4} rx={0.6} fill="#c3cbd6" opacity="0.55" />
            ))}
          </Part>
          <Part i={2} dx={32} dy={-22}>
            <Led gid={gid} cx={126} cy={76} />
          </Part>
          <Part i={3} dx={-30} dy={12}>
            <text x={72} y={102} {...LABEL}>
              OBD
            </text>
          </Part>
        </Shell>
      );

    /* -------------------------------------- LINK — sealed, no cable, antenna */
    case "link":
      return (
        <Shell {...shell}>
          <Part i={1} dx={26} dy={-34} rot={-8}>
            <BoxShell gid={gid} x={58} y={64} w={84} h={76} d={20} r={20} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={58} y={64} w={84} h={76} r={20} />
          </Part>
          {/* mounting lugs — it straps to an attachment, so they scatter */}
          <Part i={3} dx={-30} dy={-26}>
            <circle cx={68} cy={74} r="3.4" fill="#05070a" />
          </Part>
          <Part i={3} dx={30} dy={-26}>
            <circle cx={132} cy={74} r="3.4" fill="#05070a" />
          </Part>
          <Part i={3} dx={-30} dy={26}>
            <circle cx={68} cy={130} r="3.4" fill="#05070a" />
          </Part>
          <Part i={3} dx={30} dy={26}>
            <circle cx={132} cy={130} r="3.4" fill="#05070a" />
          </Part>
          {/* radio waves — LTE-M + NB-IoT */}
          <Part i={5} dy={-40}>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M100 ${58 - i * 9} m-${14 + i * 10} 0 a ${14 + i * 10} ${9 + i * 6} 0 0 1 ${28 + i * 20} 0`}
                stroke="var(--accent-hot)"
                strokeWidth="1.4"
                opacity={0.55 - i * 0.15}
                fill="none"
              />
            ))}
          </Part>
          <Part i={2} dy={-30}>
            <Led gid={gid} cx={100} cy={92} />
          </Part>
          <Part i={4} dy={26}>
            <text x={80} y={122} {...LABEL}>
              LINK
            </text>
          </Part>
        </Shell>
      );

    /* ------------------- LINK mini — 84 × 63 × 24 mm, held to that proportion */
    case "link-mini":
      return (
        <Shell {...shell}>
          <Part i={1} dx={20} dy={-28} rot={-9}>
            <BoxShell gid={gid} x={68} y={82} w={64} h={48} d={14} r={12} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={68} y={82} w={64} h={48} r={12} />
          </Part>
          <Part i={3} dx={-26} dy={-22}>
            <circle cx={78} cy={92} r="2.6" fill="#05070a" />
          </Part>
          <Part i={3} dx={26} dy={-22}>
            <circle cx={122} cy={92} r="2.6" fill="#05070a" />
          </Part>
          <Part i={2} dy={-26}>
            <Led gid={gid} cx={100} cy={106} />
          </Part>
          <Part i={4} dy={22}>
            <text x={80} y={124} {...LABEL} fontSize={7} letterSpacing={1.8}>
              LINK mini
            </text>
          </Part>
          {/* dimension callout — the spec is the story here */}
          <Part i={5} dy={34}>
            <g opacity="0.5">
              <path d="M68 140 L132 140" stroke="#6e7a89" strokeWidth="0.8" />
              <path d="M68 137 L68 143 M132 137 L132 143" stroke="#6e7a89" strokeWidth="0.8" />
              <text x={100} y={152} fill="#8d99a8" fontSize="7" textAnchor="middle" letterSpacing="1.2">
                84 mm
              </text>
            </g>
          </Part>
        </Shell>
      );

    /* --------------------------------------------- VOLT — long-life, elongated */
    case "volt":
      return (
        <Shell {...shell}>
          <Part i={1} dx={24} dy={-30} rot={-7}>
            <BoxShell gid={gid} x={44} y={82} w={112} h={54} d={18} r={14} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={44} y={82} w={112} h={54} r={14} />
          </Part>
          {/* battery cell segments — five years of them, sliding out as a bank */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Part key={i} i={2 + i} dx={(i - 2) * 26} dy={-32}>
              <rect
                x={54 + i * 20}
                y={94}
                width={13}
                height={18}
                rx={2}
                fill="var(--accent)"
                opacity={0.22 + i * 0.15}
              />
            </Part>
          ))}
          <Part i={7} dx={34} dy={20}>
            <Led gid={gid} cx={140} cy={124} />
          </Part>
          <Part i={7} dx={-34} dy={20}>
            <text x={54} y={128} {...LABEL}>
              VOLT
            </text>
          </Part>
        </Shell>
      );

    /* ------------------------------------------------------- DOT — a BLE puck */
    case "dot":
      return (
        <Shell {...shell}>
          {/* puck body: an ellipse extruded downward */}
          <Part i={0}>
            <path d="M52 108 L52 122 A48 20 0 0 0 148 122 L148 108Z" fill={`url(#${gid}-side)`} />
          </Part>
          <Part i={1} dy={-40}>
            <ellipse cx={100} cy={108} rx={48} ry={20} fill={`url(#${gid}-top)`} />
            <ellipse cx={100} cy={108} rx={48} ry={20} fill="none" stroke="#7f8b99" strokeOpacity="0.34" />
          </Part>
          <Part i={2} dy={-24}>
            <ellipse cx={100} cy={106} rx={34} ry={13} fill="#05070a" opacity="0.5" />
          </Part>
          {/* bluetooth advertisement pings */}
          {[0, 1, 2].map((i) => (
            <Part key={i} i={4 + i} dy={-14 - i * 12}>
              <ellipse
                cx={100}
                cy={108}
                rx={54 + i * 16}
                ry={22 + i * 7}
                stroke="var(--signal)"
                strokeWidth="1.1"
                opacity={0.34 - i * 0.1}
                fill="none"
              />
            </Part>
          ))}
          <Part i={3} dy={-30}>
            <Led gid={gid} cx={100} cy={104} />
          </Part>
          <Part i={3} dy={30}>
            <text x={100} y={140} {...LABEL} letterSpacing={2.6} textAnchor="middle">
              DOT
            </text>
          </Part>
        </Shell>
      );

    /* ------------------------------------------- SOLAR — panel face, sun above */
    case "solar":
      return (
        <Shell {...shell}>
          <Part i={1} dx={20} dy={-24} rot={-6}>
            <BoxShell gid={gid} x={54} y={96} w={92} h={44} d={18} r={7} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={54} y={96} w={92} h={44} r={7} />
          </Part>
          {/* the panel, hinging up and off the housing */}
          <Part i={2} dy={-52} rot={-16}>
            <path
              d="M48 96 L72 66 L164 66 L140 96 Z"
              fill={`url(#${gid}-panel)`}
              stroke="#7f8b99"
              strokeOpacity="0.34"
            />
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${56 + i * 24} 96 L${80 + i * 24} 66`}
                stroke="#8d99a8"
                strokeWidth="0.9"
                opacity="0.45"
              />
            ))}
            <path d="M52 84 L152 84" stroke="#8d99a8" strokeWidth="0.9" opacity="0.35" />
          </Part>
          {/* incoming light */}
          {[0, 1, 2].map((i) => (
            <Part key={`r${i}`} i={5 + i} dy={-30} dx={i * 10 - 10}>
              <path
                d={`M${86 + i * 26} ${34 + i * 3} L${94 + i * 26} ${56 + i * 3}`}
                stroke="var(--accent-hot)"
                strokeWidth="1.3"
                opacity={0.6 - i * 0.13}
              />
            </Part>
          ))}
          <Part i={3} dx={34} dy={18}>
            <Led gid={gid} cx={132} cy={126} />
          </Part>
          <Part i={4} dx={-30} dy={18}>
            <text x={64} y={126} {...LABEL}>
              SOLAR
            </text>
          </Part>
        </Shell>
      );

    /* ------------------------------------------- TAG — passive disc, QR + NFC */
    case "tag":
      return (
        <Shell {...shell}>
          <Part i={0}>
            <circle cx={100} cy={104} r="52" fill={`url(#${gid}-front)`} stroke="#7f8b99" strokeOpacity="0.34" />
            <circle cx={100} cy={104} r="52" fill={`url(#${gid}-spec)`} opacity="0.35" />
          </Part>
          <Part i={2} rot={-30}>
            <circle cx={100} cy={104} r="42" fill="none" stroke="#6e7a89" strokeOpacity="0.3" strokeDasharray="2 5" />
          </Part>
          {/* the QR block lifts straight off the disc */}
          <Part i={1} dy={-46} rot={-10}>
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
          </Part>
          {/* NFC field */}
          {[0, 1, 2].map((i) => (
            <Part key={i} i={3 + i} dx={26 + i * 10}>
              <path
                d={`M158 ${88 + i * 4} a ${18 + i * 9} ${18 + i * 9} 0 0 1 0 ${32 - i * 8}`}
                stroke="var(--signal)"
                strokeWidth="1.3"
                opacity={0.5 - i * 0.13}
                fill="none"
              />
            </Part>
          ))}
          <Part i={2} dy={34}>
            <text x={100} y={172} {...LABEL} letterSpacing={2.6} textAnchor="middle">
              TAG
            </text>
          </Part>
        </Shell>
      );

    default:
      return (
        <Shell {...shell}>
          <Part i={1} dx={22} dy={-30} rot={-8}>
            <BoxShell gid={gid} x={62} y={72} w={76} h={64} d={18} r={8} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={62} y={72} w={76} h={64} r={8} />
          </Part>
        </Shell>
      );
  }
}
