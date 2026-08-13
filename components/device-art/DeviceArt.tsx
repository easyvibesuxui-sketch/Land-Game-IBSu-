"use client";

import { type CSSProperties, type ReactNode, type Ref, useId } from "react";

import { asset } from "@/lib/asset";
import { bySlug } from "@/lib/devices";

/*
 * Each unit is drawn from its product photograph — the lobed flange and screw
 * bosses on LINK, LITE's fused flying lead, TAG's chamfered plate. Chrome is a
 * shared gradient vocabulary; the red LED is the only colour that ever lights
 * up.
 *
 * The drawings are not decoration for their own sake: they carry the exploded
 * state, which a photograph cannot, and hand over to the photograph as the unit
 * assembles. A device with no photograph simply keeps its drawing.
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
            href={asset(photo)}
            x="16"
            y="10"
            width="168"
            height="162"
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

/* A screw boss — the rounded lumps standing proud of a sealed housing's rim. */
function Boss({ cx, cy, r = 5.5 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#15181d" />
      <circle cx={cx} cy={cy - r * 0.22} r={r * 0.6} fill="#2b3038" opacity="0.75" />
    </>
  );
}

/* A bolt hole through a mounting ear. */
function Hole({ cx, cy, r = 4 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#05070a" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7f8b99" strokeOpacity="0.3" strokeWidth="0.8" />
    </>
  );
}

/*
 * The QR code every unit carries. Not a real payload — a plausible module
 * pattern with the three finders in place, which is what reads as a QR at
 * card size.
 */
function Qr({ x, y, s = 30, fill = "#c3cbd6" }: { x: number; y: number; s?: number; fill?: string }) {
  const u = s / 11;
  const finder = (fx: number, fy: number) => (
    <g key={`f${fx}-${fy}`}>
      <rect x={x + fx * u} y={y + fy * u} width={u * 3} height={u * 3} fill={fill} />
      <rect x={x + (fx + 1) * u} y={y + (fy + 1) * u} width={u} height={u} fill="#0a0c10" />
    </g>
  );
  const dots = [
    [5, 0], [7, 1], [5, 2], [9, 3], [4, 4], [6, 4], [10, 5],
    [8, 5], [5, 6], [7, 7], [9, 7], [4, 8], [6, 9], [8, 9], [10, 9], [5, 10],
  ];
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill="#0a0c10" />
      {finder(0.5, 0.5)}
      {finder(7.5, 0.5)}
      {finder(0.5, 7.5)}
      {dots.map(([dx, dy], i) => (
        <rect key={i} x={x + dx * u} y={y + dy * u} width={u} height={u} fill={fill} opacity="0.85" />
      ))}
    </g>
  );
}

/* The certification row — CE, WEEE, FCC, E-mark — as marks, not legible text. */
function Certs({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} fill="#98a4b3" opacity="0.7">
      <text fontSize="7" letterSpacing="0.6" fontStyle="italic">
        CE
      </text>
      <path d="M13 -6 h7 v7 h-7 z M13 -6 l7 7 M20 -6 l-7 7" stroke="#98a4b3" strokeWidth="0.7" fill="none" />
      <text x="24" y="0" fontSize="6.5" letterSpacing="0.4">
        FCC
      </text>
      <circle cx="48" cy="-2.4" r="4.4" fill="none" stroke="#98a4b3" strokeWidth="0.7" />
      <text x="45.6" y="0" fontSize="5.5">
        E
      </text>
    </g>
  );
}

/* The white silkscreen wordmark. Set to read as branding, not as a caption. */
const MARK = { fill: "#eef1f5", fontSize: 13, letterSpacing: -0.2, fontWeight: 600 } as const;

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


    /*
     * LITE — the flat black box with a corner tab at each end, the silkscreened
     * face, and the fused red/black flying lead that goes straight to the
     * battery.
     */
    case "lite":
      return (
        <Shell {...shell}>
          {/* the flying lead, unplugging away to the left */}
          <Part i={6} dx={-40} dy={26} rot={-12}>
            <path
              d="M62 92 C 40 88, 24 70, 22 48"
              stroke="var(--accent)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M62 102 C 36 100, 18 82, 16 58"
              stroke="#15181d"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* inline fuse holder, sitting on the positive lead */}
            <g transform="rotate(-42 34 70)">
              <rect x={24} y={64} width={20} height={11} rx={3} fill="#0d1015" stroke="#4a525c" strokeOpacity="0.55" />
              <rect x={28} y={67} width={12} height={5} rx={1.5} fill="#2b3038" />
            </g>
            {/* fork terminal at the battery end */}
            <g transform="rotate(-16 20 44)">
              <path d="M22 48 v-8" stroke="#c3cbd6" strokeWidth="2.6" strokeLinecap="round" />
              <path
                d="M18 40 v-6 M26 40 v-6 M18 40 h8"
                stroke="#c3cbd6"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </Part>

          {/* corner mounting tabs */}
          {(
            [
              [52, 56, -30, -26],
              [148, 56, 30, -26],
              [52, 148, -30, 26],
              [148, 148, 30, 26],
            ] as const
          ).map(([cx, cy, dx, dy], i) => (
            <Part key={i} i={4} dx={dx} dy={dy}>
              <rect x={cx - 9} y={cy - 8} width={18} height={16} rx={5} fill={`url(#${gid}-side)`} />
              <Hole cx={cx} cy={cy} r={3.4} />
            </Part>
          ))}

          <Part i={1} dx={20} dy={-34} rot={-7}>
            <BoxShell gid={gid} x={62} y={48} w={76} h={108} d={12} r={7} />
          </Part>
          <Part i={0}>
            <BoxFace gid={gid} x={62} y={48} w={76} h={108} r={7} />
          </Part>

          {/* the silkscreen: wordmark, model, code, cert row, address block */}
          <Part i={2} dy={-30}>
            <text x={70} y={70} {...MARK} fontSize={12}>
              syniotec
            </text>
            <text x={70} y={79} {...LABEL} fontSize={5.5} letterSpacing={1.6}>
              LITE
            </text>
          </Part>
          <Part i={3} dx={-34} dy={-8}>
            <Qr x={70} y={86} s={26} />
            <text x={70} y={118} {...LABEL} fontSize={4} letterSpacing={0.5}>
              IMEI 865894050000
            </text>
          </Part>
          <Part i={3} dx={34}>
            <Led gid={gid} cx={122} cy={100} />
          </Part>
          <Part i={5} dy={30}>
            <Certs x={70} y={132} scale={0.8} />
            {[0, 1, 2].map((i) => (
              <rect
                key={i}
                x={70}
                y={140 + i * 5}
                width={i === 2 ? 34 : 56}
                height={1.6}
                rx={0.8}
                fill="#98a4b3"
                opacity="0.4"
              />
            ))}
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
          {/* the label wraps the top face */}
          <Part i={3} dx={-30} dy={-16}>
            <rect x={70} y={70} width={60} height={38} rx={2} fill="#0a0c10" stroke="#4a525c" strokeOpacity="0.4" />
            <text x={76} y={82} {...LABEL} fontSize={6} letterSpacing={0.6}>
              syniotec OBD
            </text>
            <Qr x={76} y={84} s={20} />
            <Certs x={100} y={102} scale={0.62} />
          </Part>
          <Part i={2} dx={32} dy={-24}>
            <Led gid={gid} cx={126} cy={74} />
          </Part>
        </Shell>
      );

    /*
     * LINK — the sealed, matte-black rugged box: a lobed base flange with a
     * bolt hole in each side ear, screw bosses standing proud around the rim,
     * and a raised lid with a single moulding line down the middle.
     */
    case "link":
      return (
        <Shell {...shell}>
          {/* base flange, with the side ears it bolts through */}
          <Part i={0}>
            <path d="M46 82 h-14 a7 7 0 0 0 -7 7 v22 a7 7 0 0 0 7 7 h14 z" fill={`url(#${gid}-side)`} />
            <path d="M154 82 h14 a7 7 0 0 1 7 7 v22 a7 7 0 0 1 -7 7 h-14 z" fill={`url(#${gid}-side)`} />
            <Hole cx={35} cy={100} />
            <Hole cx={165} cy={100} />
            <rect
              x={46}
              y={40}
              width={108}
              height={120}
              rx={15}
              fill={`url(#${gid}-front)`}
              stroke="#4a525c"
              strokeOpacity="0.45"
            />
          </Part>

          {/* the lid lifts up and back off the seal */}
          <Part i={1} dx={22} dy={-52} rot={-9}>
            <rect x={58} y={52} width={84} height={96} rx={13} fill={`url(#${gid}-top)`} />
            <rect x={58} y={52} width={84} height={96} rx={13} fill={`url(#${gid}-spec)`} opacity="0.18" />
            <rect
              x={58}
              y={52}
              width={84}
              height={96}
              rx={13}
              fill="none"
              stroke="#5c646f"
              strokeOpacity="0.4"
            />
            {/* the moulding line down the face */}
            <path d="M100 66 L100 134" stroke="#39414a" strokeWidth="1.1" />
          </Part>

          {/* bosses scatter off the rim */}
          {(
            [
              [100, 38, -34],
              [100, 162, 34],
              [54, 52, -26],
              [146, 52, -26],
              [54, 148, 26],
              [146, 148, 26],
            ] as const
          ).map(([cx, cy, dy], i) => (
            <Part key={i} i={3} dx={(cx - 100) * 0.5} dy={dy}>
              <Boss cx={cx} cy={cy} />
            </Part>
          ))}

          {/* radio waves — LTE-M + NB-IoT */}
          <Part i={5} dy={-40}>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M100 ${32 - i * 8} m-${14 + i * 10} 0 a ${14 + i * 10} ${9 + i * 6} 0 0 1 ${28 + i * 20} 0`}
                stroke="var(--accent-hot)"
                strokeWidth="1.4"
                opacity={0.55 - i * 0.15}
                fill="none"
              />
            ))}
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
          {/*
            The cell bank sits under the label plate: sealed, it is simply not
            visible, and the explosion is what reveals where five years of
            runtime comes from.
          */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Part key={i} i={2 + i} dx={(i - 2) * 30} dy={-40}>
              <rect
                x={54 + i * 20}
                y={92}
                width={14}
                height={20}
                rx={3}
                fill="var(--accent)"
                opacity={0.3 + i * 0.14}
              />
            </Part>
          ))}

          {/* label plate — the whole top face is printed */}
          <Part i={7} dy={-16}>
            <rect x={52} y={86} width={96} height={46} rx={2} fill="#0a0c10" stroke="#4a525c" strokeOpacity="0.4" />
            <text x={58} y={95} {...LABEL} fontSize={5} letterSpacing={0.4}>
              syniotec VOLT
            </text>
            <Qr x={58} y={98} s={22} />
            <Qr x={116} y={98} s={22} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={84} y={100 + i * 5} width={28} height={1.4} rx={0.7} fill="#98a4b3" opacity="0.4" />
            ))}
            <Certs x={84} y={126} scale={0.55} />
          </Part>

          {/* mounting flange along the bottom edge */}
          <Part i={8} dy={30}>
            <path d="M62 136 h34 a5 5 0 0 1 5 5 v8 a5 5 0 0 1 -5 5 h-34 z" fill={`url(#${gid}-side)`} />
            <Hole cx={72} cy={145} r={3.4} />
          </Part>

          {/* the sealed connector on the end */}
          <Part i={8} dx={46}>
            <rect x={164} y={98} width={16} height={26} rx={3} fill="#15181d" stroke="#4a525c" strokeOpacity="0.45" />
            <rect x={168} y={104} width={8} height={14} rx={1.5} fill="#05070a" />
          </Part>

          <Part i={9} dx={-34} dy={24}>
            <Led gid={gid} cx={60} cy={142} />
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

    /*
     * TAG — the passive plate: chamfered corners, a bolt hole at each of them,
     * the wordmark engraved across the top, and along the bottom the NFC mark,
     * the black reader dome and the QR block.
     */
    case "tag":
      return (
        <Shell {...shell}>
          {/* the plate itself, corners chamfered off */}
          <Part i={0}>
            <path
              d="M42 68 l10 -10 h96 l10 10 v72 l-10 10 h-96 l-10 -10 z"
              fill={`url(#${gid}-front)`}
              stroke="#7f8b99"
              strokeOpacity="0.34"
            />
            <path d="M42 68 l10 -10 h96 l10 10 v72 l-10 10 h-96 l-10 -10 z" fill={`url(#${gid}-spec)`} opacity="0.16" />
          </Part>

          {/* corner bolt holes — it is screwed to the asset and left there */}
          {(
            [
              [55, 70, -30, -26],
              [145, 70, 30, -26],
              [55, 138, -30, 26],
              [145, 138, 30, 26],
            ] as const
          ).map(([cx, cy, dx, dy], i) => (
            <Part key={i} i={4} dx={dx} dy={dy}>
              <Hole cx={cx} cy={cy} r={4.2} />
            </Part>
          ))}

          {/* engraved wordmark, lifting off the plate */}
          <Part i={1} dy={-44} rot={-8}>
            <text x={68} y={96} fill="#c3cbd6" fontSize="19" fontWeight={600} letterSpacing="-0.4">
              syniotec
            </text>
          </Part>

          {/* the reader dome */}
          <Part i={2} dy={-24}>
            <circle cx={100} cy={124} r="15" fill="#c3cbd6" opacity="0.35" />
            <circle cx={100} cy={124} r="13" fill="#05070a" />
            <circle cx={96} cy={119} r="5" fill="#3a424c" opacity="0.7" />
          </Part>

          {/* NFC mark */}
          <Part i={3} dx={-34}>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${70 + i * 4} ${118 - i * 3} a ${7 + i * 4} ${7 + i * 4} 0 0 1 0 ${13 + i * 6}`}
                stroke="var(--signal)"
                strokeWidth="1.4"
                opacity={0.75 - i * 0.16}
                fill="none"
              />
            ))}
          </Part>

          {/* the QR block */}
          <Part i={3} dx={38} dy={18}>
            <Qr x={120} y={108} s={26} />
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
