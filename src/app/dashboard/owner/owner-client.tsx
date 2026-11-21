
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
} from "lucide-react";

import AdminAnalytics from "@/components/dashboard/admin-analytics";

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
  rentalTerms: string;
  status: "Pending" | "Approved" | "Rejected";
  ownerId?: string;
}

interface Booking {
  _id: string;
  equipmentId: string;
  userId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const dashboardCards = [
  {
    title: "Add Equipment",
    description: "Add new equipment for rent.",
    href: "/dashboard/owner/add-equipment",
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

export default function OwnerDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

      const [equipmentRes, bookingRes] = await Promise.all([
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
      ]);

      const [equipmentData, bookingData] = await Promise.all([
        equipmentRes.json() as Promise<EquipmentResponse>,
        bookingRes.json() as Promise<BookingResponse>,
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
        !Array.isArray(equipmentData.equipment) ||
        !Array.isArray(bookingData.data)
      ) {
        throw new Error("Invalid dashboard data received.");
      }

      setEquipment(equipmentData.equipment);
      setBookings(bookingData.data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
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

    return () => {
      controller.abort();
    };
  }, [fetchDashboard, retry]);

  const totalEquipment = equipment.length;

  const approvedEquipment = equipment.filter(
    (item) => item.status === "Approved"
  ).length;

  const pendingBookings = bookings.filter(
    (item) => item.bookingStatus === "Pending"
  ).length;

  const totalRevenue = bookings
    .filter((item) => item.paymentStatus === "Paid")
    .reduce(
      (total, item) =>
        total +
        (Number.isFinite(item.totalAmount) ? item.totalAmount : 0),
      0
    );

  const stats = [
    {
      title: "Total Equipment",
      value: totalEquipment,
      icon: Package,
      description: `${approvedEquipment} approved`,
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      description: `${pendingBookings} pending`,
    },
    {
      title: "Total Revenue",
      value: `৳${formatAmount(totalRevenue)}`,
      icon: Wallet,
      description: "From paid bookings",
    },
    {
      title: "Pending Bookings",
      value: pendingBookings,
      icon: Clock,
      description: "Need your attention",
    },
  ];

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

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setRetry((previous) => previous + 1)}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
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

        {/* Dashboard Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-indigo-50 p-3">
                    <Icon className="h-6 w-6 text-indigo-600" />
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

        {/* Business Analytics */}
        <section className="mt-8">
          <AdminAnalytics />
        </section>

        {/* Dashboard Quick Links */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Equipment Management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add and manage your rental equipment.
            </p>

            <Link
              href="/dashboard/owner/add-equipment"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Booking Management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Review and manage customer booking requests.
            </p>

            <Link
              href="/dashboard/owner/bookings"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Manage Bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Recent Bookings
          </h2>

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
                  {bookings.slice(0, 5).map((booking) => {
                    const matchedEquipment = equipment.find(
                      (item) => item._id === booking.equipmentId
                    );

                    return (
                      <tr
                        key={booking._id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 pr-4 font-medium text-gray-800">
                          {booking._id.slice(-8)}
                        </td>

                        <td className="py-4 pr-4">
                          {matchedEquipment?.name || "Unknown"}
                        </td>

                        <td className="py-4 pr-4">
                          ৳{formatAmount(booking.totalAmount)}
                        </td>

                        <td className="py-4">
                          {booking.bookingStatus}
                        </td>

                        <td className="py-4">
                          {booking.paymentStatus}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/owner/bookings"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View All Bookings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
