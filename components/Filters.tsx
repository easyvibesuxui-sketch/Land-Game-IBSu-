/**
 * Shared SVG filter definitions, mounted once at the root.
 *  · liquid-refract — displaces what sits behind the glass, so cards warp
 *    the backdrop instead of merely blurring it
 *  · goo           — merges nearby shapes during the menu morph so edges
 *    flow together rather than snapping
 *  · chrome-noise  — drives the generated backdrop's filament texture
 */
export default function Filters() {
  return (
    <svg
      aria-hidden
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id="liquid-refract" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale={16}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>

        <filter id="chrome-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.004 0.02"
            numOctaves={4}
            seed={19}
            result="t"
          />
          <feColorMatrix
            in="t"
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.58  0 0 0 0 0.64  0 0 0 -1.6 0.9"
          />
        </filter>
      </defs>
    </svg>
  );
}
