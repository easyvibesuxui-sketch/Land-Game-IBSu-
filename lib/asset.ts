/**
 * Prefix a public asset URL with the deployment's base path.
 *
 * Next rewrites `basePath` into `next/link` hrefs, `next/image` sources and its
 * own chunk URLs, but not into a raw URL we hand to something else — the
 * `<image href>` inside the device SVGs is the case here. Anything served from
 * `public/` and referenced by hand has to go through this.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
