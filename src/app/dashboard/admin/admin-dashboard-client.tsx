
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  MapPin,
  Tag,
  Users,
  CalendarDays,
  CreditCard,
  TrendingUp,
  User,
  UserCheck,
  UserCog,
  UserCircle,
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

// ==========================================
// Types
// ==========================================

interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Booking {
  _id: string;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt?: string;
}

interface AdminAnalytics {
  users: {
    total: number;
    customers: number;
    owners: number;
    admins: number;
  };
  equipment: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
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
  monthlyRevenue: {
    year: number;
    month: number;
    revenue: number;
    transactions: number;
  }[];
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  transactions: number;
}

type ToastType = "success" | "error";

interface ToastState {
  message: string;
  type: ToastType;
}

// ==========================================
// API
// ==========================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const EQUIPMENT_API_URL = `${API_URL}/equipment`;
const BOOKING_API_URL = `${API_URL}/bookings`;
const USER_API_URL = `${API_URL}/users`;

const formatAmount = (amount: number) =>
  Number(amount || 0).toLocaleString("en-BD");

const defaultAnalytics: AdminAnalytics = {
  users: {
    total: 0,
    customers: 0,
    owners: 0,
    admins: 0,
  },
  equipment: {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  },
  bookings: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  },
  revenue: {
    total: 0,
    paidTransactions: 0,
  },
  monthlyRevenue: [],
};

// ==========================================
// Component
// ==========================================

export default function AdminDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [analytics, setAnalytics] =
    useState<AdminAnalytics>(defaultAnalytics);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  // ==========================================
  // Toast Notification
  // ==========================================

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ message, type });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  // ==========================================
  // Fetch Dashboard Data
  // ==========================================

  const fetchDashboardData = useCallback(async () => {
    try {
      setError("");

      const [
        analyticsResponse,
        pendingResponse,
        bookingsResponse,
      ] = await Promise.all([
        fetch(`${USER_API_URL}/analytics`, {
          credentials: "include",
          cache: "no-store",
        }),

        fetch(`${EQUIPMENT_API_URL}/admin/pending`, {
          credentials: "include",
          cache: "no-store",
        }),

        fetch(`${BOOKING_API_URL}/admin/all-bookings`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const [
        analyticsData,
        pendingData,
        bookingsData,
      ] = await Promise.all([
        analyticsResponse.json(),
        pendingResponse.json(),
        bookingsResponse.json(),
      ]);

      if (!analyticsResponse.ok || !analyticsData.success) {
        throw new Error(
          analyticsData.message || "Failed to load admin analytics."
        );
      }

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.message || "Failed to load pending equipment."
        );
      }

      if (!bookingsResponse.ok) {
        throw new Error(
          bookingsData.message || "Failed to load bookings."
        );
      }

      setAnalytics({
        ...defaultAnalytics,
        ...analyticsData.data,
        users: {
          ...defaultAnalytics.users,
          ...analyticsData.data.users,
        },
        equipment: {
          ...defaultAnalytics.equipment,
          ...analyticsData.data.equipment,
        },
        bookings: {
          ...defaultAnalytics.bookings,
          ...analyticsData.data.bookings,
        },
        revenue: {
          ...defaultAnalytics.revenue,
          ...analyticsData.data.revenue,
        },
        monthlyRevenue: Array.isArray(
          analyticsData.data.monthlyRevenue
        )
          ? analyticsData.data.monthlyRevenue
          : [],
      });

      setEquipment(
        Array.isArray(pendingData.equipment)
          ? pendingData.equipment
          : []
      );

      setBookings(
        Array.isArray(bookingsData.data)
          ? bookingsData.data
          : []
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==========================================
  // Refresh Dashboard
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    showToast("Dashboard refreshed successfully.", "success");
  };

  // ==========================================
  // Approve / Reject Equipment
  // ==========================================

  const updateStatus = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status.toLowerCase()} this equipment?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(
        `${EQUIPMENT_API_URL}/admin/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Equipment status update failed."
        );
      }

      showToast(
        `Equipment ${status.toLowerCase()} successfully.`,
        "success"
      );

      await fetchDashboardData();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // Statistics
  // ==========================================

  const {
    users,
    equipment: equipmentData,
    bookings: bookingData,
    revenue,
  } = analytics;

  const equipmentStats = [
    {
      title: "Total Equipment",
      value: equipmentData.total,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Approved Equipment",
      value: equipmentData.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Equipment",
      value: equipmentData.pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Rejected Equipment",
      value: equipmentData.rejected,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const bookingStats = [
    {
      title: "Total Bookings",
      value: bookingData.total,
      icon: CalendarDays,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Confirmed Bookings",
      value: bookingData.confirmed,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Bookings",
      value: bookingData.pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Cancelled Bookings",
      value: bookingData.cancelled,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Completed Bookings",
      value: bookingData.completed,
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Paid Transactions",
      value: revenue.paidTransactions,
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const userStats = [
    {
      title: "Total Users",
      value: users.total,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Customers",
      value: users.customers,
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Owners",
      value: users.owners,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Admins",
      value: users.admins,
      icon: UserCog,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const monthlyRevenue: MonthlyRevenue[] =
    analytics.monthlyRevenue.map((item) => {
      const monthName = new Date(
        item.year,
        item.month - 1
      ).toLocaleString("en", {
        month: "short",
      });

      return {
        month: `${monthName} ${item.year}`,
        revenue: Number(item.revenue || 0),
        transactions: Number(item.transactions || 0),
      };
    });

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-500">
          Loading admin dashboard...
        </span>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      {/* Toast Notification */}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-5 z-[100] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border bg-white px-5 py-4 text-sm font-medium shadow-xl sm:right-6 sm:top-6 ${
            toast.type === "success"
              ? "border-green-200 text-green-700"
              : "border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}

          <span>{toast.message}</span>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            className="ml-2 text-gray-400 transition hover:text-gray-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3">
              <ShieldCheck className="h-7 w-7 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage and monitor your EquipRent platform.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Management Links */}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/admin/equipment"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Package className="h-5 w-5" />
            Manage All Equipment
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <Users className="h-5 w-5" />
            Manage All Users
          </Link>

          <Link
            href="/dashboard/admin/bookings"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5c53fe] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4940e8]"
          >
            <CalendarDays className="h-5 w-5" />
            Manage All Bookings
          </Link>

          <Link
            href="/dashboard/admin/profile"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
          >
            <UserCircle className="h-5 w-5" />
            My Profile
          </Link>
        </div>

        {/* Error Message */}

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Platform Analytics */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Platform Analytics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Overview of users, equipment, bookings and actual payments.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total Users */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-indigo-600">
                    {users.total}
                  </h2>
                </div>

                <div className="rounded-xl bg-indigo-50 p-4">
                  <Users className="h-7 w-7 text-indigo-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {users.customers} Customers · {users.owners} Owners · {users.admins} Admins
              </p>
            </div>

            {/* Total Equipment */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Equipment
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-indigo-600">
                    {equipmentData.total}
                  </h2>
                </div>

                <div className="rounded-xl bg-indigo-50 p-4">
                  <Package className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Total Bookings */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Bookings
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-blue-600">
                    {bookingData.total}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <CalendarDays className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Actual Paid Revenue */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Paid Revenue
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                    ৳{formatAmount(revenue.total)}
                  </h2>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <CreditCard className="h-7 w-7 text-emerald-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {revenue.paidTransactions} successful transactions
              </p>
            </div>
          </div>
        </section>

        {/* User Overview */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              User Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monitor registered users and their platform roles.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {userStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-4 ${stat.bg}`}>
                      <Icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly Revenue Chart */}

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Monthly Revenue
              </h2>

              <p className="text-sm text-gray-500">
                Actual paid transactions from the payments collection.
              </p>
            </div>
          </div>

          {monthlyRevenue.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500">
              No monthly revenue data available yet.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyRevenue}
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

          <div className="mt-5 border-t pt-4">
            <p className="text-sm text-gray-500">
              Total successful transactions:{" "}
              <span className="font-bold text-gray-900">
                {revenue.paidTransactions}
              </span>
            </p>
          </div>
        </section>

        {/* Booking Overview */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Booking Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monitor all customer bookings and payment activity.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {bookingStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-4 ${stat.bg}`}>
                      <Icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Equipment Overview */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Equipment Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monitor equipment submissions and approval status.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {equipmentStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-4 ${stat.bg}`}>
                      <Icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pending Equipment */}

        <section className="mt-10">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pending Equipment
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review equipment submitted by owners.
              </p>
            </div>

            <span className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
              {equipmentData.pending} Pending
            </span>
          </div>

          {equipment.length === 0 ? (
            <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                No Pending Equipment
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                All equipment submissions have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {equipment.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="h-52 bg-gray-100">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-14 w-14 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.name}
                      </h3>

                      <span className="shrink-0 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                        {item.status}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-gray-500">
                      {item.description}
                    </p>

                    <div className="space-y-3 border-t pt-4 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        {item.category}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        {item.location}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800">
                          Brand:
                        </span>{" "}
                        {item.brand || "N/A"}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800">
                          Model:
                        </span>{" "}
                        {item.model || "N/A"}
                      </p>

                      <p className="text-lg font-bold text-indigo-600">
                        ৳{formatAmount(item.rentalPrice)} / {item.rentalType}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(item._id, "Approved")
                        }
                        disabled={updatingId !== null}
                        className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === item._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(item._id, "Rejected")
                        }
                        disabled={updatingId !== null}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === item._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Bookings */}

        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest booking records across the platform.
              </p>
            </div>

            <Link
              href="/dashboard/admin/bookings"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage All Bookings →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No bookings found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Booking ID</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Booking Status</th>
                    <th className="py-3">Payment Status</th>
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
    </main>
  );
}
