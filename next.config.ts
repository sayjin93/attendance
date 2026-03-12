import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uet.edu.al",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      inferno: "inferno/dist/index.dev.esm.js",
      "inferno-create-element":
        "inferno-create-element/dist/index.dev.esm.js",
      "inferno-hydrate": "inferno-hydrate/dist/index.dev.esm.js",
    },
  },
};
export default nextConfig;
