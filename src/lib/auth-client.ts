import { createAuthClient } from "better-auth/react";

// Better Auth client bound to the app's own origin.
//
// With no explicit `baseURL`, requests go to `/api/auth/*` and are proxied
// to the backend by the rewrite in `next.config.ts`. Keeping everything
// same-origin makes the OAuth state and session cookies first-party —
// browsers block `SameSite=Lax` cookies across sites, which previously
// caused `error=state_mismatch` on Google signup.
export const authClient = createAuthClient();

// Export the commonly used functions
export const { signIn, signUp, signOut, useSession } = authClient;