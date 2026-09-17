import { createMDX } from "fumadocs-mdx/next";

const isProd = process.env.NODE_ENV === "production";

// GitHub Pages serves the site from a sub-path. Shared with the Screenshot
// component through NEXT_PUBLIC_BASE_PATH, because files in `public/` are not
// prefixed automatically.
const basePath = isProd ? "/portal-claude-plugins" : "";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  },
  images: {
    unoptimized: true
  }
};

const withMDX = createMDX();

export default withMDX(config);
