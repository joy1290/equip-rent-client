
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/lib/auth-client";

type Role = "admin" | "owner" | "customer";

const DASHBOARD_HOME: Record<Role, string> = {
  admin: "/dashboard/admin",
  owner: "/dashboard/owner",
  customer: "/dashboard/customer",
};

const Spinner = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div
      aria-label="Loading"
      className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
    />
  </div>
);

/**
 * Client-side RBAC guard (Challenge 2 on the frontend).
 *
 * - While the session is resolving it shows a spinner — a logged-in user is
 *   NEVER redirected to /login just because the session took a moment to
 *   load on reload of a private route.
 * - Only when the session is definitively absent does it redirect to
 *   /login?next=<current path>.
 * - A logged-in user opening another role's dashboard is sent to their own.
 */
export default function RoleGuard({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const segment = pathname.split("/")[2];
  const requiredRole =
    segment === "admin" || segment === "owner" || segment === "customer"
      ? segment
      : undefined;

  const user = data?.user;
  const role = ((user as { role?: string } | undefined)?.role ??
    "customer") as Role;

  const authorized =
    Boolean(user) && (!requiredRole || role === requiredRole);

  useEffect(() => {
    if (isPending || authorized) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else {
      router.replace(DASHBOARD_HOME[role] ?? "/");
    }
  }, [isPending, authorized, user, role, pathname, router]);

  if (!authorized) return <Spinner />;

  return <>{children}</>;
}
