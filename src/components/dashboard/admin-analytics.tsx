
"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ShieldCheck,
  UserCheck,
  Package,
  CheckCircle,
  CreditCard,
  Clock,
  AlertCircle,
} from "lucide-react";

interface MonthlyStat {
  month: string; // "YYYY-MM"
  bookings: number;
  revenue: number;
}

interface AdminAnalytics {
  totalUsers: number;
  totalOwners: number;
  totalCustomers: number;
  totalEquipment: number;
  pendingApprovals: number;
  totalBookings: number;
  completedRentals: number;
  totalRevenue: number;
  monthlyStats: MonthlyStat[];
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/analytics`;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-01" → "Jan" */
const shortMonth = (value: string) => {
  const monthIndex = Number(value.split("-")[1]) - 1;
  return MONTH_LABELS[monthIndex] ?? value;
};

const kpiCard =
  "rounded-xl border bg-white p-5 shadow-sm flex items-start justify-between gap-3";

export default function AdminAnalytics() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/admin`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load analytics."
          );
        }

        setData(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Analytics unavailable."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border bg-white py-14 shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <span className="ml-3 text-sm font-medium text-gray-500">
          Loading platform analytics...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {error || "Analytics unavailable."}
      </div>
    );
  }

  const chartData = data.monthlyStats.map((stat) => ({
    ...stat,
    label: shortMonth(stat.month),
  }));

  const kpis = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Owners",
      value: data.totalOwners,
      icon: ShieldCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Customers",
      value: data.totalCustomers,
      icon: UserCheck,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Total Equipment",
      value: data.totalEquipment,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Pending Approvals",
      value: data.pendingApprovals,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Completed Rentals",
      value: data.completedRentals,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Bookings",
      value: data.totalBookings,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Total Revenue",
      value: `৳${Number(data.totalRevenue).toLocaleString("en-BD")}`,
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section aria-label="Platform analytics">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Platform Analytics
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Live totals from users, equipment, bookings and payments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div key={kpi.title} className={kpiCard}>
              <div>
                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                  {kpi.title}
                </p>

                <p
                  className={`mt-2 text-2xl font-bold sm:text-3xl ${kpi.color}`}
                >
                  {kpi.value}
                </p>
              </div>

              <div className={`shrink-0 rounded-xl p-3 ${kpi.bg}`}>
                <Icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Monthly Bookings */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900">
              Monthly Bookings
            </h3>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  width={35}
                />
                <Tooltip
                  formatter={(value, name) => [
                    Number(value ?? 0),
                    name === "bookings" ? "Bookings" : String(name ?? ""),
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="bookings"
                  name="Bookings"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">
              Monthly Revenue
            </h3>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  width={55}
                />
                <Tooltip
                  formatter={(value) => [
                    `৳${Number(value ?? 0).toLocaleString("en-BD")}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
