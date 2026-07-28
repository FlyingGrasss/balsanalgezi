import type { NextConfig } from "next";
import path from "node:path";

const modernPolyfill = path.resolve(__dirname, "lib/modern-polyfill.js");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  turbopack: {
    resolveAlias: {
      "../build/polyfills/polyfill-module": "./lib/modern-polyfill.js",
      "next/dist/build/polyfills/polyfill-module": "./lib/modern-polyfill.js",
    },
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "../build/polyfills/polyfill-module": modernPolyfill,
        "next/dist/build/polyfills/polyfill-module": modernPolyfill,
      };
    }

    return config;
  },
};

export default nextConfig;
