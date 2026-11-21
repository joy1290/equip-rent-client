
import type { NextConfig } from "next";

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.VERCEL
    ? "https://equip-rent-server.vercel.app"
    : "http://localhost:5000")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  env: {
    NEXT_PUBLIC_API_URL: "/api",
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
