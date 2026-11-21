
"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  CheckCircle,
  Clock,
  CreditCard,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

interface MonthlyEarning {
  month: string; // "YYYY-MM"
  earnings: number;
  bookings: number;
}

interface OwnerAnalytics {
  totalListedEquipment: number;
  approvedEquipment: number;
  pendingEquipment: number;
  totalBookings: number;
  completedRentals: number;
  totalEarnings: number;
  monthlyEarnings: MonthlyEarning[];
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

export default function OwnerAnalytics() {
  const [data, setData] = useState<OwnerAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/owner`, {
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
          Loading your business analytics...
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

  const chartData = data.monthlyEarnings.map((entry) => ({
    ...entry,
    label: shortMonth(entry.month),
  }));

  const kpis = [
    {
      title: "Listed Equipment",
      value: data.totalListedEquipment,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Approved Equipment",
      value: data.approvedEquipment,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Equipment",
      value: data.pendingEquipment,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Total Bookings",
      value: data.totalBookings,
      icon: CalendarDays,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Completed Rentals",
      value: data.completedRentals,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Earnings",
      value: `৳${Number(data.totalEarnings).toLocaleString("en-BD")}`,
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section aria-label="Business analytics">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Business Analytics
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your equipment, bookings and earnings at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        {/* Monthly Earnings */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">
              Monthly Earnings
            </h3>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                    "Earnings",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#earningsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
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
      </div>
    </section>
  );
}
