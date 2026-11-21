
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user as
    | { name?: string; email?: string; role?: string }
    | undefined;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await authClient.signOut();

      setIsMenuOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Equipment", href: "/equipment" },
    { name: "About Us", href: "/about" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "Contact Us", href: "/contact" },
  ];

  const dashboardHref =
    user?.role === "admin"
      ? "/dashboard/admin"
      : user?.role === "owner"
        ? "/dashboard/owner"
        : "/dashboard/customer";

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors ${
      pathname === href
        ? "text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-indigo-600 sm:text-2xl"
        >
          EquipRent<span className="text-gray-800">.</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop User Actions */}
        <div className="hidden items-center gap-3 lg:flex xl:gap-4">
          {isPending ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : user ? (
            <>
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 xl:px-4"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </Link>

              <div className="max-w-40 text-right">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {user.name || "User"}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {user.role || "customer"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 xl:px-4"
              >
                <LogOut size={17} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 transition hover:text-indigo-600"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 xl:px-5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-100 bg-white px-4 py-5 shadow-lg sm:px-6 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5">

            {/* Navigation Links */}
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 ${linkClass(link.href)} ${
                    pathname === link.href ? "bg-indigo-50" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              {isPending ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : user ? (
                <div className="flex flex-col gap-4">

                  {/* User Information */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <User size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">
                        {user.name || "User"}
                      </p>
                      <p className="text-sm capitalize text-gray-500">
                        {user.role || "customer"}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard */}
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-100"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={18} />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg px-4 py-2.5 text-center font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
