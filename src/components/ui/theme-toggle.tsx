
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Dark / light theme toggle. The preference is stored in localStorage
 * (`theme`) and applied to <html class="dark"> by an inline script in the
 * root layout before hydration, so there is no flash of the wrong theme.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;

    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);

    try {
      localStorage.setItem("theme", nextDark ? "dark" : "light");
    } catch {
      // Storage unavailable (private mode) — theme still applies for now
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
    >
      {mounted ? (
        dark ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )
      ) : (
        <span className="block h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
