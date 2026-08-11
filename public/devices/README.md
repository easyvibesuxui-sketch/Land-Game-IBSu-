# Device images

These are **derived** files. The masters live in `assets/product-photos/`, which
is outside `public/` so the 1.5–4.5 MB originals are never served.

To add or replace one:

1. Drop the master in `assets/product-photos/` — cut out on transparency, since
   it sits directly on the dark card with no plate behind it.
2. Add it to `MAP` in `scripts/derive-device-images.mjs` under the device's slug.
3. Run `node scripts/derive-device-images.mjs` — it trims to content, caps the
   long edge at 900 px and writes WebP with alpha (each lands under ~75 KB).
4. Point the device's `photo` field at `/devices/<slug>.webp` in `lib/devices.ts`.

A device with no `photo` renders its drawn SVG as the finished state — nothing
breaks while a file is missing, and each addition upgrades one device.
