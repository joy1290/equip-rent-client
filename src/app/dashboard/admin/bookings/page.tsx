
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Package,
  Search,
  XCircle,
} from "lucide-react";

interface Booking {
  _id: string;
  customerId: string;
  ownerId: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  contactNumber: string;
  deliveryAddress: string;
  additionalNotes?: string;
  totalAmount: number;
  paymentStatus: "Pending" | "Paid";
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
  total: number;
  data: Booking[];
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

  const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/bookings/admin/all-bookings`,
  {
    method: "GET",
    credentials: "include",
  }
);

      const result: BookingResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch bookings.");
      }

      setBookings(result.data || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching bookings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        booking._id.toLowerCase().includes(search) ||
        booking.customerId.toLowerCase().includes(search) ||
        booking.ownerId.toLowerCase().includes(search) ||
        booking.equipmentId.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        booking.bookingStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        booking.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `৳${amount.toLocaleString("en-BD")}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5c53fe]" />
        <span className="ml-3 text-gray-600">
          Loading bookings...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5c53fe]"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              All Bookings
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor and manage all equipment rental bookings.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="rounded-lg bg-[#5c53fe] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4940e8]"
          >
            Refresh Bookings
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Total Bookings"
            value={totalBookings}
            icon={<CalendarDays size={22} />}
            color="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Confirmed"
            value={confirmedBookings}
            icon={<CheckCircle2 size={22} />}
            color="bg-green-100 text-green-600"
          />

          <StatCard
            title="Pending"
            value={pendingBookings}
            icon={<Clock size={22} />}
            color="bg-yellow-100 text-yellow-600"
          />

          <StatCard
            title="Cancelled"
            value={cancelledBookings}
            icon={<XCircle size={22} />}
            color="bg-red-100 text-red-600"
          />

          <StatCard
            title="Paid Bookings"
            value={paidBookings}
            icon={<CreditCard size={22} />}
            color="bg-purple-100 text-purple-600"
          />

        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search booking, customer or equipment ID..."
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#5c53fe]"
              />
            </div>

            {/* Booking Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5c53fe]"
            >
              <option value="All">All Booking Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Payment Status */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5c53fe]"
            >
              <option value="All">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Payment Pending</option>
            </select>

          </div>
        </div>

        {/* Booking List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">
              Booking Records
            </h2>

            <span className="text-sm text-gray-500">
              {filteredBookings.length} results
            </span>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Package className="mx-auto mb-3 text-gray-300" size={40} />

              <h3 className="font-semibold text-gray-700">
                No bookings found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">

                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Booking ID</th>
                    <th className="px-5 py-4">Equipment ID</th>
                    <th className="px-5 py-4">Customer ID</th>
                    <th className="px-5 py-4">Rental Period</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Booking Status</th>
                    <th className="px-5 py-4">Payment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          #{booking._id.slice(-8)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(booking.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700">
                          {booking.equipmentId.slice(-8)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Qty: {booking.quantity}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[130px] truncate text-gray-700" title={booking.customerId}>
                          {booking.customerId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="whitespace-nowrap text-gray-700">
                          {formatDate(booking.startDate)}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-xs text-gray-400">
                          to {formatDate(booking.endDate)}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatAmount(booking.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                            booking.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Showing booking records from the database. This page is for
          admin monitoring; booking status changes remain under owner
          management.
        </p>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-lg p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
