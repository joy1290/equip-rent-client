
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about EquipRent — the platform connecting equipment owners and customers through a transparent, secure rental marketplace.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Verified Equipment",
    description:
      "Every listing is reviewed and approved by our admins before it appears on the platform.",
  },
  {
    icon: Clock,
    title: "Flexible Rental Periods",
    description:
      "Rent by the day, week or month — choose the period that fits your project and budget.",
  },
  {
    icon: Package,
    title: "Transparent Pricing",
    description:
      "See clear rental prices and total amounts before you pay. No hidden charges.",
  },
  {
    icon: Users,
    title: "Two-Sided Marketplace",
    description:
      "Owners earn from idle equipment while customers get affordable access to quality gear.",
  },
];

const steps = [
  {
    number: "01",
    title: "Browse & Search",
    description:
      "Search equipment by name, category or location and filter by price, availability and rental type.",
  },
  {
    number: "02",
    title: "Book & Pay",
    description:
      "Pick your rental dates, confirm the total amount and pay securely through Stripe Checkout.",
  },
  {
    number: "03",
    title: "Owner Approval",
    description:
      "The equipment owner approves your request, and the rental period begins on your start date.",
  },
  {
    number: "04",
    title: "Return & Rate",
    description:
      "Return the equipment on time. Completed rentals are confirmed automatically by the platform.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 px-4 py-16 text-white sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200 sm:text-sm">
            About EquipRent
          </p>

          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            A Transparent Marketplace for Equipment Rental
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base sm:leading-8">
            EquipRent connects equipment owners with customers who need
            quality equipment for a specific period — making rental
            simple, affordable and secure for everyone.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/equipment"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Browse Equipment
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10"
            >
              Become an Owner
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 sm:text-sm">
              Our Purpose
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Why We Built EquipRent
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
              <p>
                Buying expensive equipment for a one-time project rarely
                makes sense. Yet thousands of owners sit with idle
                equipment while customers overpay for short-term needs.
              </p>

              <p>
                EquipRent solves both sides of that problem. Owners list
                their equipment once and earn from it whenever it is
                available. Customers search, compare and book exactly what
                they need — for a day, a week or a month — with secure
                online payment and clear rental terms.
              </p>

              <p>
                Every listing is approved by our administrators, every
                payment runs through Stripe, and every booking is tracked
                from request to completion.
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                "Admin-approved equipment listings",
                "Secure Stripe payments with transaction records",
                "Daily, weekly and monthly rental options",
                "Built-in search, filters and price sorting",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm font-medium text-gray-700"
                >
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-green-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-4 font-bold text-gray-900">
                    {value.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 sm:text-sm">
              How It Works
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              From Search to Return in Four Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <span className="text-sm font-extrabold tracking-widest text-indigo-600">
                  STEP {step.number}
                </span>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-700 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <Wrench size={36} className="mx-auto text-indigo-200" />

          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
            Ready to Get Started?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
            Join EquipRent today — list your equipment as an owner or
            find your next rental as a customer.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Create Account
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
