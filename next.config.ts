import type { NextConfig } from "next";

// Production backend URL - set via environment variable
// Defaults to localhost for development, Vercel production URL when on Vercel
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.VERCEL ? "https://equip-rent-server.vercel.app" : "http://localhost:5000")
).replace(/\/+$/, "");

/**
 * Trusted origins for Better Auth OAuth and cookies.
 * Must include the production frontend origin for cross-origin cookie support.
 */
const TRUSTED_ORIGINS = [
  process.env.VERCEL ? "https://equip-rent-client.vercel.app" : "http://localhost:3000",
  // Add any other trusted origins here
].filter(Boolean);

/**
 * Redirect redirects after auth flows.
 * Uses relative paths so they work regardless of deployment origin.
 */
const redirectBase = "/";

const nextConfig: NextConfig = {
  /* config options here */
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
    // Safety net: client code builds API URLs from this value, so it must
    // always be the relative proxy path — never an absolute backend URL.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
  // Export TRUSTED_ORIGINS for use in the app
  experimental: {
    // Note: configure trusted origins via BetterAuth client config instead
  },
};

export default nextConfig;