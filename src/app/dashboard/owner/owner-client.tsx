
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  CalendarDays,
  Wallet,
  Clock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
  TrendingUp,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Equipment {
  _id: string;
  name: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Booking {
  _id: string;
  customerId: string;
  ownerId: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
  equipment?: {
    id: string;
    name?: string;
    category?: string;
  };
}

interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
}

interface OwnerAnalytics {
  equipment: {
    total: number;
    approved: number;
    pending: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    paidTransactions: number;
  };
  monthlyRevenue: MonthlyRevenue[];
}

interface EquipmentResponse {
  success: boolean;
  message?: string;
  equipment?: Equipment[];
}

interface BookingResponse {
  success: boolean;
  message?: string;
  data?: Booking[];
}

interface AnalyticsResponse {
  success: boolean;
  message?: string;
  data?: OwnerAnalytics;
}

const dashboardCards = [
  {
    title: "Add Equipment",
    description: "Add new equipment for rent.",
    href: "/dashboard/owner/add-equipment",
    icon: Package,
  },
  {
    title: "My Equipment",
    description: "View, edit and manage your listed equipment.",
    href: "/dashboard/owner/my-equipment",
    icon: Package,
  },
  {
    title: "My Bookings",
    description: "Review and manage booking requests.",
    href: "/dashboard/owner/bookings",
    icon: CalendarDays,
  },
  {
    title: "Browse Equipment",
    description: "Explore available rental equipment.",
    href: "/equipment",
    icon: Package,
  },
  {
    title: "My Profile",
    description: "Update your profile information.",
    href: "/dashboard/owner/profile",
    icon: User,
  },
];

const formatAmount = (amount: number) => {
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("en-BD");
};

const getMonthName = (month: number) => {
  return new Date(2000, month - 1).toLocaleString("en", {
    month: "short",
  });
};

export default function OwnerDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const fetchDashboard = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("API URL is not configured.");
      }

      const [equipmentRes, bookingRes, analyticsRes] =
        await Promise.all([
          fetch(`${API_URL}/equipment/my-equipment`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          }),

          fetch(`${API_URL}/bookings/owner-bookings`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          }),

          fetch(`${API_URL}/bookings/owner/analytics`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          }),
        ]);

      const [equipmentData, bookingData, analyticsData] =
        await Promise.all([
          equipmentRes.json() as Promise<EquipmentResponse>,
          bookingRes.json() as Promise<BookingResponse>,
          analyticsRes.json() as Promise<AnalyticsResponse>,
        ]);

      if (!equipmentRes.ok || !equipmentData.success) {
        throw new Error(
          equipmentData.message || "Failed to load equipment."
        );
      }

      if (!bookingRes.ok || !bookingData.success) {
        throw new Error(
          bookingData.message || "Failed to load bookings."
        );
      }

      if (
        !analyticsRes.ok ||
        !analyticsData.success ||
        !analyticsData.data
      ) {
        throw new Error(
          analyticsData.message || "Failed to load owner analytics."
        );
      }

      if (
        !Array.isArray(equipmentData.equipment) ||
        !Array.isArray(bookingData.data) ||
        !Array.isArray(analyticsData.data.monthlyRevenue)
      ) {
        throw new Error("Invalid dashboard data received.");
      }

      setEquipment(equipmentData.equipment);
      setBookings(bookingData.data);
      setAnalytics(analyticsData.data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchDashboard(controller.signal);

    return () => controller.abort();
  }, [fetchDashboard, retry]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-500">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded-lg bg-red-50 p-4 text-red-600">
          {error || "Unable to load dashboard."}
        </p>

        <button
          type="button"
          onClick={() => setRetry((previous) => previous + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Equipment",
      value: analytics.equipment.total,
      description: `${analytics.equipment.approved} approved`,
      icon: Package,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Total Bookings",
      value: analytics.bookings.total,
      description: `${analytics.bookings.pending} pending`,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `৳${formatAmount(analytics.revenue.total)}`,
      description: `${analytics.revenue.paidTransactions} paid transactions`,
      icon: Wallet,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Bookings",
      value: analytics.bookings.pending,
      description: "Need your attention",
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  const monthlyChartData = analytics.monthlyRevenue.map((item) => ({
    month: `${getMonthName(item.month)} ${item.year}`,
    revenue: item.revenue,
  }));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            OWNER PANEL
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your equipment, bookings and earnings.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </h2>

                <p className="mt-2 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Booking Overview */}
        <section className="mt-8">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Booking Overview
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Confirmed",
                value: analytics.bookings.confirmed,
                icon: CheckCircle,
                color: "text-green-600 bg-green-50",
              },
              {
                title: "Completed",
                value: analytics.bookings.completed,
                icon: CheckCircle,
                color: "text-blue-600 bg-blue-50",
              },
              {
                title: "Cancelled",
                value: analytics.bookings.cancelled,
                icon: XCircle,
                color: "text-red-600 bg-red-50",
              },
              {
                title: "Pending Equipment",
                value: analytics.equipment.pending,
                icon: Package,
                color: "text-yellow-600 bg-yellow-50",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        {item.title}
                      </p>

                      <p className="text-xl font-bold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly Revenue Chart */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Monthly Revenue
              </h2>

              <p className="text-sm text-gray-500">
                Your paid rental transactions by month.
              </p>
            </div>
          </div>

          {monthlyChartData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              No paid revenue data available yet.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: number) =>
                      `৳${value.toLocaleString("en-BD")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      `৳${Number(value).toLocaleString("en-BD")}`,
                      "Revenue",
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#5c53fe"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-indigo-50 p-3">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>

                    <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
                  </div>

                  <h3 className="mt-5 font-semibold text-gray-900">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h2>

            <Link
              href="/dashboard/owner/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500">
              No bookings available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Booking ID</th>
                    <th className="py-3 pr-4">Equipment</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Booking Status</th>
                    <th className="py-3">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.slice(0, 5).map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4 pr-4 font-medium text-gray-800">
                        {booking._id.slice(-8)}
                      </td>

                      <td className="py-4 pr-4">
                        {booking.equipment?.name || "Equipment"}
                      </td>

                      <td className="py-4 pr-4">
                        ৳{formatAmount(booking.totalAmount)}
                      </td>

                      <td className="py-4 pr-4">
                        {booking.bookingStatus}
                      </td>

                      <td className="py-4">
                        {booking.paymentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
