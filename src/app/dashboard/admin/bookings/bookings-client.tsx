
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  Eye,
  RefreshCw,
  X,
  Users,
  Wallet,
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
  bookingStatus:
    | "Pending"
    | "Confirmed"
    | "Cancelled"
    | "Completed";
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string;
    email?: string;
  };
  owner?: {
    id: string;
    name?: string;
    email?: string;
  };
  equipment?: {
    id: string;
    name?: string;
    category?: string;
  };
}

interface BookingResponse {
  success: boolean;
  message?: string;
  total?: number;
  data: Booking[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/bookings/admin/all-bookings`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: BookingResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch bookings."
        );
      }

      setBookings(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        booking._id.toLowerCase().includes(search) ||
        (booking.customerId ?? "").toLowerCase().includes(search) ||
        (booking.ownerId ?? "").toLowerCase().includes(search) ||
        (booking.equipmentId ?? "").toLowerCase().includes(search) ||
        (booking.customer?.name ?? "").toLowerCase().includes(search) ||
        (booking.customer?.email ?? "").toLowerCase().includes(search) ||
        (booking.owner?.name ?? "").toLowerCase().includes(search) ||
        (booking.owner?.email ?? "").toLowerCase().includes(search) ||
        (booking.equipment?.name ?? "").toLowerCase().includes(search);

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

  const completedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Completed"
  ).length;

  const paidBookings = bookings.filter(
    (booking) => booking.paymentStatus === "Paid"
  ).length;

  const totalPaidAmount = bookings
    .filter((booking) => booking.paymentStatus === "Paid")
    .reduce((total, booking) => total + (booking.totalAmount || 0), 0);

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatAmount = (amount: number) => {
    return `৳${(amount || 0).toLocaleString("en-BD")}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
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
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5c53fe] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4940e8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Bookings"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={() => fetchBookings(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

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
            title="Completed"
            value={completedBookings}
            icon={<Package size={22} />}
            color="bg-indigo-100 text-indigo-600"
          />

          <StatCard
            title="Paid Bookings"
            value={paidBookings}
            icon={<CreditCard size={22} />}
            color="bg-purple-100 text-purple-600"
          />

        </div>

        {/* Revenue Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <Wallet size={24} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Amount from Paid Bookings
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {formatAmount(totalPaidAmount)}
              </h2>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search booking, customer, owner or equipment..."
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#5c53fe]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5c53fe]"
            >
              <option value="All">All Booking Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>

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

          {(searchTerm || statusFilter !== "All" || paymentFilter !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setPaymentFilter("All");
              }}
              className="mt-4 text-sm font-semibold text-[#5c53fe] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Booking List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
            <h2 className="font-bold text-gray-900">
              Booking Records
            </h2>

            <span className="text-sm text-gray-500">
              Showing {filteredBookings.length} of {totalBookings} bookings
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
              <table className="w-full min-w-[1100px] text-left text-sm">

                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Booking ID</th>
                    <th className="px-5 py-4">Equipment</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Owner</th>
                    <th className="px-5 py-4">Rental Period</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Booking Status</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Action</th>
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
                          {booking.equipment?.name || "Equipment"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {booking.equipment?.category || "N/A"} · Qty: {booking.quantity}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[150px] truncate font-medium text-gray-700">
                          {booking.customer?.name || "Customer"}
                        </p>

                        <p className="mt-1 max-w-[150px] truncate text-xs text-gray-400">
                          {booking.customer?.email || "N/A"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[150px] truncate font-medium text-gray-700">
                          {booking.owner?.name || "Owner"}
                        </p>

                        <p className="mt-1 max-w-[150px] truncate text-xs text-gray-400">
                          {booking.owner?.email || "N/A"}
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

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#5c53fe] px-3 py-2 text-xs font-semibold text-[#5c53fe] transition hover:bg-[#5c53fe] hover:text-white"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Admin can monitor all booking records. Booking status changes
          remain under owner management.
        </p>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Booking Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  #{selectedBooking._id}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close booking details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <DetailItem
                label="Equipment"
                value={selectedBooking.equipment?.name || "N/A"}
              />

              <DetailItem
                label="Category"
                value={selectedBooking.equipment?.category || "N/A"}
              />

              <DetailItem
                label="Customer"
                value={selectedBooking.customer?.name || "N/A"}
              />

              <DetailItem
                label="Customer Email"
                value={selectedBooking.customer?.email || "N/A"}
              />

              <DetailItem
                label="Owner"
                value={selectedBooking.owner?.name || "N/A"}
              />

              <DetailItem
                label="Owner Email"
                value={selectedBooking.owner?.email || "N/A"}
              />

              <DetailItem
                label="Contact Number"
                value={selectedBooking.contactNumber || "N/A"}
              />

              <DetailItem
                label="Quantity"
                value={String(selectedBooking.quantity)}
              />

              <DetailItem
                label="Start Date"
                value={formatDate(selectedBooking.startDate)}
              />

              <DetailItem
                label="End Date"
                value={formatDate(selectedBooking.endDate)}
              />

              <DetailItem
                label="Total Amount"
                value={formatAmount(selectedBooking.totalAmount)}
              />

              <DetailItem
                label="Created At"
                value={formatDate(selectedBooking.createdAt)}
              />

              <DetailItem
                label="Booking Status"
                value={selectedBooking.bookingStatus}
              />

              <DetailItem
                label="Payment Status"
                value={selectedBooking.paymentStatus}
              />

              <div className="sm:col-span-2">
                <DetailItem
                  label="Delivery Address"
                  value={selectedBooking.deliveryAddress || "N/A"}
                />
              </div>

              <div className="sm:col-span-2">
                <DetailItem
                  label="Additional Notes"
                  value={selectedBooking.additionalNotes || "No additional notes"}
                />
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full rounded-lg bg-[#5c53fe] py-3 text-sm font-semibold text-white transition hover:bg-[#4940e8]"
            >
              Close
            </button>
          </div>
        </div>
      )}
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
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
