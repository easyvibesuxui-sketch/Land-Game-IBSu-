# Product photographs

Drop a file here and point the device's `photo` field at it in `lib/devices.ts`:

```ts
{ slug: "obd", /* … */ photo: "/devices/obd.png" }
```

- **Cut out on transparency (PNG or WebP).** The image sits directly on the dark
  card with no plate behind it, so a white studio background reads as a white
  rectangle.
- **Square-ish, roughly 800 × 700 or larger.** It is drawn into the art's
  `0 0 200 200` viewBox at `xMidYMid meet`, so aspect ratio is preserved and
  only the longest edge matters.

A device with no `photo` renders its drawn SVG as the finished state — nothing
breaks while files are missing, and each upload upgrades one device.
