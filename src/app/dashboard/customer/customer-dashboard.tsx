
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle,
  CreditCard,
  Search,
  User,
  Heart,
  Clock,
  XCircle,
  Wallet,
  ArrowRight,
  Package,
  RefreshCw,
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/bookings`;

interface Booking {
  _id: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
}

const dashboardCards = [
  {
    title: "My Bookings",
    description: "View and manage your equipment bookings.",
    href: "/dashboard/customer/bookings",
    icon: CalendarCheck,
  },
  {
    title: "Payment History",
    description: "Check your payment transactions.",
    href: "/dashboard/customer/payments",
    icon: CreditCard,
  },
  {
    title: "Browse Equipment",
    description: "Explore available rental equipment.",
    href: "/equipment",
    icon: Search,
  },
  {
    title: "My Favorites",
    description: "View and manage your favorite equipment.",
    href: "/dashboard/customer/favorites",
    icon: Heart,
  },
];

const formatAmount = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const { data: session } = useSession();

  // Fetch customer bookings
  useEffect(() => {
    const controller = new AbortController();

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/my-bookings`, {
          credentials: "include",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load dashboard"
          );
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid booking data received");
        }

        setBookings(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => controller.abort();
  }, [retry]);

  // Fetch favorites
  useEffect(() => {
    if (!session?.user) return;

    const controller = new AbortController();

    const fetchFavorites = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/equipment/favorites`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data.favorites)) {
          localStorage.setItem(
            "customer_favorites",
            JSON.stringify(
              data.favorites.map((favorite: { _id: string }) => favorite._id)
            )
          );
        }
      } catch {
        // Favorites are non-critical.
      }
    };

    fetchFavorites();

    return () => controller.abort();
  }, [session?.user]);

  // Booking statistics
  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Confirmed"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Cancelled"
  ).length;

  const paidAmount = bookings.reduce((total, booking) => {
    if (booking.paymentStatus !== "Paid") return total;

    return total + Number(booking.totalAmount || 0);
  }, 0);

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: CalendarCheck,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Pending Bookings",
      value: pendingBookings,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Confirmed Bookings",
      value: confirmedBookings,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Cancelled Bookings",
      value: cancelledBookings,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  const statusData = [
    {
      label: "Confirmed",
      count: confirmedBookings,
      color: "bg-green-500",
    },
    {
      label: "Pending",
      count: pendingBookings,
      color: "bg-yellow-500",
    },
    {
      label: "Cancelled",
      count: cancelledBookings,
      color: "bg-red-500",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-7 sm:mb-9">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Customer Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Welcome to your EquipRent dashboard.
          </p>
        </div>

        {/* Analytics */}
        <section className="mb-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Booking Overview
            </h2>

            {!loading && (
              <button
                type="button"
                onClick={() => setRetry((prev) => prev + 1)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border bg-white p-6 text-center shadow-sm">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

              <p className="mt-4 text-sm text-gray-500">
                Loading booking analytics...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 sm:p-7">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-red-700">
                    Unable to load dashboard
                  </h3>

                  <p className="mt-1 break-words text-sm text-red-600">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRetry((prev) => prev + 1)}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 sm:text-sm">
                            {stat.title}
                          </p>

                          <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            {stat.value}
                          </h3>
                        </div>

                        <div
                          className={`shrink-0 rounded-xl p-3 ${stat.color}`}
                        >
                          <Icon size={23} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paid Amount */}
              <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 sm:p-4">
                    <Wallet size={26} className="sm:h-8 sm:w-8" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 sm:text-sm">
                      Total Amount Paid
                    </p>

                    <h3 className="mt-1 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                      {formatAmount(paidAmount)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Booking Status Overview */}
              <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
                <h3 className="mb-6 text-base font-bold text-gray-900 sm:text-lg">
                  Booking Status Overview
                </h3>

                {totalBookings === 0 ? (
                  <p className="text-sm text-gray-500">
                    No booking data available yet.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {statusData.map((item) => {
                      const percentage =
                        (item.count / totalBookings) * 100;

                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs sm:text-sm">
                            <span className="font-semibold text-gray-700">
                              {item.label}
                            </span>

                            <span className="shrink-0 text-gray-500">
                              {item.count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>

                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 sm:h-3">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    Recent Bookings
                  </h3>

                  <Link
                    href="/dashboard/customer/bookings"
                    className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 sm:text-sm"
                  >
                    View All
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {recentBookings.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package
                      size={36}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      No bookings found.
                    </p>

                    <Link
                      href="/equipment"
                      className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Browse Equipment
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-all text-xs font-semibold text-gray-800 sm:text-sm">
                            Booking ID: {booking._id}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              booking.bookingStatus === "Confirmed"
                                ? "bg-green-50 text-green-700"
                                : booking.bookingStatus === "Cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>

                          <span className="text-sm font-bold text-gray-900">
                            {formatAmount(booking.totalAmount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* Quick Access */}
        <section className="mb-8">
          <h2 className="mb-5 text-lg font-bold text-gray-900 sm:text-xl">
            Quick Access
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white sm:h-12 sm:w-12">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {card.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo-600">
                    Explore
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Customer Account */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="shrink-0 rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
              <User size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                My Profile
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Manage your bookings, favorites and payment activities from here.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
