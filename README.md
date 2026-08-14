# syniotec · devices

A showroom for the syniotec telematics range — seven units for construction
machinery, and nothing else. No pricing, no contact forms, no company pages.

The brief was UI-first: the scroll choreography, the morphing navigation, the
mixed-shape cards and the frosted-glass material are the product; the hardware
is what they're carrying.

Live at **https://easyvibesuxui-sketch.github.io/Land-Game-IBSu-/**

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Shape of the code

```
app/
  page.tsx                 showcase(hero → marquee → range) → class flip → index → outro
  devices/[slug]/page.tsx  one page per unit, statically generated
  globals.css              tokens, glass material, card silhouettes
components/
  nav/Nav.tsx              the minimal bar and the panel it morphs into
  sections/Showcase.tsx    the pinned background the first three sections share
  HeroSequence.tsx         the VOLT teardown, scrubbed frame by frame
  Backdrop.tsx             the generated chrome-filament atmosphere
  Marquee.tsx              the spec band, self-propelled and scroll-shoved
  cards/GlassTile.tsx      the liquid-glass primitive
  device-art/DeviceArt.tsx every unit, drawn
  sections/                the page, section by section
lib/
  devices.ts               the single source of truth for all content
  useSectionProgress.ts    scroll progress through a section
  useReduced.ts            hydration-safe reduced-motion flag
  asset.ts                 base-path prefix for hand-written asset URLs
  backdrop.ts              optional photographic plate under the atmosphere
  motion.ts                shared springs and easings
scripts/
  derive-device-images.mjs masters in assets/ → served images in public/
  derive-hero-sequence.mjs the teardown clip → the frame sequence
```

## Things worth knowing before editing

**Content lives in one place.** `lib/devices.ts` drives the grid, the class
sections, the nav panel, the footer index and every detail route. Adding a unit
there adds it everywhere, including its statically generated page.

**Images are derived, never hand-placed.** Masters live in `assets/` — outside
`public/`, because they run 1.5–4.5 MB each — and the scripts in `scripts/`
write the served versions. Re-run the matching script after changing a master;
the output is committed.

**Two ways a device is shown, and they work together.** A device with a `photo`
still draws its SVG: the drawing carries the exploded state, which a photograph
cannot, and hands over to the photograph as the unit assembles. A device with no
photo simply keeps its drawing, so nothing breaks while a file is missing.

**The custom CSS sits in `@layer components`.** That is deliberate: Tailwind
emits utilities in a later layer, so `absolute` on a `.glass` element still
wins. Move those rules to the top level and a bare `.glass { position: relative }`
silently overrides every positioning utility in the app.

**Conflicting Tailwind utilities are resolved by Tailwind's order, not yours.**
Pairing a base `items-end` with a conditional `items-center` lets the base win
regardless of which comes later in the string. Every alignment utility for a
given element has to come from one branch.

**Card silhouettes are matched to grid areas.** `Showroom.tsx` maps each unit to
a named area sized for its photograph — CORE stands portrait and takes the 2×2
arch, TAG is a landscape plate and takes a 2×1 band, LINK is square so it holds
the circle. Reshuffling the areas without reshuffling the shapes produces
stretched ellipses and sheared labels.

**The teardown composites with `screen`, which constrains its ancestry.**
`mix-blend-mode` blends an element with its nearest stacking-context ancestor,
so a transformed wrapper would isolate the canvas and its black matte would
paint as a rectangle. Any transform belongs on the canvas itself.

**Reduced motion is a real code path.** Use `useReduced()` from
`lib/useReduced.ts`, never Motion's `useReducedMotion` directly — the latter
reads the media query during the first client render and will desynchronise
hydration wherever markup branches on it.

## Deployment

`.github/workflows/pages.yml` builds a static export and publishes it to GitHub
Pages on every push. Pages serves a project repo from a sub-path, so that build
sets `STATIC_EXPORT` and `NEXT_PUBLIC_BASE_PATH`; `next dev` and any root-served
host want neither, which is why both are environment variables rather than
permanent settings in `next.config.ts`.

`netlify.toml` is kept for a Netlify deploy, which has to be connected from
Netlify's own dashboard.

## Content source

Device names, descriptions and specifications are transcribed from syniotec's
published product pages for telematics on construction machinery. The product
photographs and the teardown clip were supplied; the drawings were made from
them.
