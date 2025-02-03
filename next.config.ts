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
};
export default nextConfig;
