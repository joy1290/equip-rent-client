
import { Suspense, type ReactNode } from "react";

import RoleGuard from "@/components/auth/role-guard";

const GuardFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div
      aria-label="Loading"
      className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
    />
  </div>
);

/**
 * Every /dashboard/* route is private and role-based: RoleGuard verifies
 * the session and the role matching the dashboard segment (admin/owner/
 * customer) before rendering anything.
 *
 * Suspense is required because RoleGuard reads usePathname(), which must
 * stream in after prerendering (Next.js 16).
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<GuardFallback />}>
      <RoleGuard>{children}</RoleGuard>
    </Suspense>
  );
}
