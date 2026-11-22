
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "EquipRent | Equipment Rental Platform",
    template: "%s | EquipRent",
  },
  description:
    "Rent the equipment you need, when you need it. Explore and book equipment easily with EquipRent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-gray-50">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />

        <Suspense fallback={<div className="h-16 w-full bg-white" />}>
          <Navbar />
        </Suspense>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
