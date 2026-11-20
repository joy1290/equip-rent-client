import type { NextConfig } from "next";

/**
 * Backend that every `/api/*` request is proxied to.
 *
 * The browser must only ever talk to this origin: Better Auth's OAuth state
 * and session cookies are `SameSite=Lax`, and browsers refuse to send them
 * across sites. Before this proxy, the frontend (`equip-rent-client.vercel.app`)
 * called the backend (`equip-rent-server.vercel.app`) directly — a different
 * site — so the state cookie was dropped and Google signup failed with
 * `error=state_mismatch`.
 */
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.VERCEL ? "https://equip-rent-server.vercel.app" : "http://localhost:5000")
).replace(/\/+$/, "");

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
};

export default nextConfig;
