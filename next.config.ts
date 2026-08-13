import type { NextConfig } from "next";

/*
 * GitHub Pages serves a project repo from a sub-path, so that build needs a
 * static export plus a base path. Netlify and `next dev` serve from the root
 * and take neither — hence the switch rather than a permanent setting.
 *
 * NEXT_PUBLIC_BASE_PATH carries the prefix into the client bundle for the one
 * place Next cannot rewrite for us: raw asset URLs inside SVG. See lib/asset.ts.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "true"
    ? {
        output: "export",
        basePath,
        // Directory-style URLs, so /devices/core resolves without a rewrite rule.
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
