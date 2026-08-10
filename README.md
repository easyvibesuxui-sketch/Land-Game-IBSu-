# syniotec · devices

A showroom for the syniotec telematics range — ten units for construction
machinery, and nothing else. No pricing, no contact forms, no company pages.

The brief was UI-first: the scroll choreography, the morphing navigation, the
mixed-shape cards and the frosted-glass material are the product; the hardware
is what they're carrying.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Shape of the code

```
app/
  page.tsx                 hero → showroom → class flip → spec rail → outro
  devices/[slug]/page.tsx  one page per unit, statically generated
  globals.css              tokens, glass material, card silhouettes
components/
  nav/Nav.tsx              the minimal bar and the panel it morphs into
  Backdrop.tsx             the generated chrome-filament backdrop
  cards/GlassTile.tsx      the liquid-glass primitive
  device-art/DeviceArt.tsx all ten units, drawn
  sections/                the page, section by section
lib/
  devices.ts               the single source of truth for all content
  motion.ts                shared springs and easings
  useReduced.ts            hydration-safe reduced-motion flag
```

## Things worth knowing before editing

**Content lives in one place.** `lib/devices.ts` drives the grid, the rail, the
nav panel, the footer index and every detail route. Adding a unit there adds it
everywhere, including its statically generated page.

**The custom CSS sits in `@layer components`.** That is deliberate: Tailwind
emits utilities in a later layer, so `absolute` on a `.glass` element still
wins. Move those rules to the top level and a bare `.glass { position: relative }`
silently overrides every positioning utility in the app.

**Card silhouettes are matched to grid areas.** `Showroom.tsx` maps each unit to
a named area sized for its shape — the arch gets a 2×2 block, the circle a
single square cell so it stays round. Reshuffling the areas without reshuffling
the shapes produces stretched ellipses and sheared labels.

**Reduced motion is a real code path.** Use `useReduced()` from
`lib/useReduced.ts`, never Motion's `useReducedMotion` directly — the latter
reads the media query during the first client render and will desynchronise
hydration wherever markup branches on it.

## Content source

Device names, descriptions and specifications are transcribed from syniotec's
published product pages for telematics on construction machinery. Product
photography was not available, so every unit is drawn as SVG from its published
dimensions and features.
