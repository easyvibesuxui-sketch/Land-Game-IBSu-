/**
 * Optional photographic plate laid under the generated filaments.
 *
 * The generated backdrop stands on its own, so this stays `null` until a plate
 * is actually in `public/bg/`. Set it to the derived path — e.g.
 * `"/bg/hero.webp"` — and every `<Backdrop image={HERO_BG}>` picks it up.
 *
 * The plate goes *under* the wires and the hot core, not over them: it supplies
 * depth and grain, while the drawn layer keeps its motion. Anything bright
 * enough to fight the headline should be darkened before it lands here — the
 * derive script does not tone-map.
 */
export const HERO_BG: string | null = null;
