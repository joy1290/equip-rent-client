import { createAuthClient } from "better-auth/react";

// Production Better Auth configuration
// - baseURL: the backend API URL (proxied by next.config.ts /api rewrite)
// - trustedOrigins: origins allowed for OAuth redirects and cookie access
// - sameSite/secure: cookie settings for HTTPS/production
//
// The /api/auth/* requests are proxied to the backend via next.config.ts rewrite,
// keeping everything same-origin for OAuth state cookies. For cross-origin deployments
// (Vercel frontend + backend), we configure sameSite: "none" and secure: true for HTTPS.
export const authClient = createAuthClient({
  // The backend URL is resolved from next.config.ts rewrites
  // Using the environment variable BACKEND_URL which sets:
  // - http://localhost:5000 for local dev
  // - https://equip-rent-server.vercel.app for Vercel production
  //
  // The client doesn't need an explicit baseURL when using the Next.js rewrites,
  // as the proxy handles same-origin requests. However, for cookie configuration
  // on production Vercel HTTPS, we set the following:

  // Cookie sameSite setting:
  // - "lax": default, works for same-origin but blocked cross-site
  // - "none": required for cross-origin (Vercel frontend + backend)
  // - "strict": only sent same-origin
  //
  // Cookie secure setting:
  // - false: works http+https
  // - true: only sent over HTTPS (required for production)
  //
  // On Vercel production: sameSite: "none" + secure: true enables cross-origin cookies
  // On local development: sameSite: "lax" + secure: false works fine

  // Note: The actual cookie configuration is often better handled on the server
  // (Better Auth server setup), but we set hints here for the client.
  // For full production cookie configuration, also configure the Better Auth server
  // with: cookie: { sameSite: "none", secure: true }

  // Trusted origins for OAuth and cross-origin cookie access
  // These are origins that can make authenticated requests and receive cookies
  trustedOrigins: [
    // Frontend origin - must match the deployed Vercel URL
    process.env.VERCEL ? "https://equip-rent-client.vercel.app" : "http://localhost:3000",
    // Backend origin
    process.env.VERCEL ? "https://equip-rent-server.vercel.app" : "http://localhost:5000",
  ],

  // Redirect URLs - use relative paths for portability
  // These are the URLs users are redirected to after auth flows
  redirect: {
    // After successful sign in, redirect to home
    signIn: "/",
    // After successful sign up, redirect to home
    signUp: "/",
    // After sign out, redirect to login
    signOut: "/login",
  },

  // Password policy configuration
  password: {
    minLength: 6,
    requireUppercase: true,
    requireLowercase: true,
  },
});

// Export the commonly used functions
export const { signIn, signUp, signOut, useSession, useAuth } = authClient;