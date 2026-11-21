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
  status: "Pending" | "Approved" | "Rejected";
}

interface Booking {
  _id: string;
  totalAmount: number;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: "Pending" | "Paid";
}

interface EquipmentStatistics {
  totalEquipment: number;
  pendingEquipment: number;
  approvedEquipment: number;
  rejectedEquipment: number;
}

interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  paidBookings: number;
  paidRevenue: number;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;
const BOOKING_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/bookings`;

export default function AdminDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [statistics, setStatistics] =
    useState<EquipmentStatistics>({
      totalEquipment: 0,
      pendingEquipment: 0,
      approvedEquipment: 0,
      rejectedEquipment: 0,
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        pendingResponse,
        bookingsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          credentials: "include",
          cache: "no-store",
        }),

        fetch(`${API_URL}/admin/pending`, {
          credentials: "include",
          cache: "no-store",
        }),

        fetch(`${BOOKING_API_URL}/admin/all-bookings`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const statsData = await statsResponse.json();
      const pendingData = await pendingResponse.json();
      const bookingsData = await bookingsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsData.message || "Failed to load equipment statistics."
        );
      }

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.message || "Failed to load pending equipment."
        );
      }

      if (!bookingsResponse.ok) {
        throw new Error(
          bookingsData.message || "Failed to load booking statistics."
        );
      }

      setStatistics(statsData.statistics);
      // Equipment list is the pending ones for review
      setEquipment(pendingData.equipment || []);
      setBookings(bookingsData.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Approve / Reject Equipment
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
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/${id}/status`,
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

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      setMessage(
        `Equipment ${status.toLowerCase()} successfully.`
      );

      await fetchDashboardData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Equipment Statistics
  const equipmentStats = [
    {
      title: "Total Equipment",
      value: statistics.totalEquipment,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Approved Equipment",
      value: statistics.approvedEquipment,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Equipment",
      value: statistics.pendingEquipment,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Rejected Equipment",
      value: statistics.rejectedEquipment,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  // Booking Statistics
  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Pending"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Cancelled"
  ).length;

  const paidBookings = bookings.filter(
    (booking) => booking.paymentStatus === "Paid"
  ).length;

  // Paid Revenue - only Paid bookings
  const paidRevenue = bookings.reduce((total, booking) => {
    if (booking.paymentStatus !== "Paid") {
      return total;
    }

    return total + Number(booking.totalAmount || 0);
  }, 0);

  const bookingStats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: CalendarDays,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Confirmed Bookings",
      value: confirmedBookings,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Bookings",
      value: pendingBookings,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Cancelled Bookings",
      value: cancelledBookings,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Paid Bookings",
      value: paidBookings,
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
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
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Management Buttons */}
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
        </div>

        {/* Platform Analytics (Challenge 3) */}
        <section className="mt-10">
          <AdminAnalytics />
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

            {/* Paid Revenue */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Paid Revenue
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                    ৳{paidRevenue.toLocaleString("en-BD")}
                  </h2>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <CreditCard className="h-7 w-7 text-emerald-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Calculated from paid bookings only.
              </p>
            </div>
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

        {/* Notifications */}
        {message && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

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
              {statistics.pendingEquipment} Pending
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
                  {/* Equipment Image */}
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
                    {/* Title and Status */}
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

                    {/* Details */}
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
                        ৳{Number(item.rentalPrice || 0).toLocaleString("en-BD")} / {item.rentalType}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 border-t pt-4">
                      <button
                        onClick={() => updateStatus(item._id, "Approved")}
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
                        onClick={() => updateStatus(item._id, "Rejected")}
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

        {/* All Equipment Management Table */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              All Equipment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complete list of all equipment items with management actions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Equipment Name</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Rental Price</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                { /* Note: In a full implementation, this would fetch all equipment from the API */}
                {/* For now, showing pending equipment above; admin can view all via the link below */}
                <tr>
                  <td className="py-4 pr-4" colSpan={5}>
                    <p className="text-sm text-gray-500">
                      Use the management links above to view and manage equipment.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* All Bookings Management Table */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              All Bookings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complete list of all booking records with management capabilities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Booking ID</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Equipment</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Booking Status</th>
                  <th className="py-3">Payment Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4 pr-4 font-medium text-gray-800">
                      {booking._id.slice(-8)}
                    </td>

                    <td className="py-4 pr-4">
                      {/* In full implementation, fetch user info */}
                      Customer
                    </td>

                    <td className="py-4 pr-4">
                      {/* In full implementation, fetch equipment info */}
                      Equipment
                    </td>

                    <td className="py-4 pr-4">
                      ৳{booking.totalAmount.toLocaleString("en-BD")}
                    </td>

                    <td className="py-4">
                      {booking.bookingStatus}
                    </td>

                    <td className="py-4">
                      {booking.paymentStatus}
                    </td>

                    <td className="py-4">
                      {/* Action buttons for admin */}
                      <div className="flex gap-1">
                        <button
                          className="text-indigo-600 text-xs hover:text-indigo-800"
                        >
                          View
                        </button>
                        <button
                          className="text-red-600 text-xs hover:text-red-800"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}