
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  CreditCard,
  MapPin,
  Package,
  User,
  Phone,
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/bookings`;
const PAYMENT_API = `${process.env.NEXT_PUBLIC_API_URL}/payments`;

interface Equipment {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
  category?: string;
  location?: string;
}

interface Booking {
  _id: string;
  customerId?: string;
  ownerId?: string;
  equipmentId: string | Equipment;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  contactNumber?: string;
  deliveryAddress?: string;
  additionalNotes?: string;
  equipment?: Equipment;
}

interface BookingResponse {
  success: boolean;
  message?: string;
  data?: Booking[];
  bookings?: Booking[];
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  checkoutUrl?: string;
}

const PAGE_SIZE = 10;

const paymentBadge: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-600",
  Refunded: "bg-gray-100 text-gray-600",
};

const bookingBadge: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-600",
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatAmount = (amount?: number) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-BD");
};

const getEquipmentName = (booking: Booking) => {
  return booking.equipment?.name || "Equipment";
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);

  const fetchBookings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/my-bookings`, {
        method: "GET",
        credentials: "include",
        signal,
        cache: "no-store",
      });

      const result = (await response.json()) as BookingResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch bookings");
      }

      const bookingData = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.bookings)
          ? result.bookings
          : [];

      setBookings(bookingData);
      setPage(1);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchBookings(controller.signal);

    return () => controller.abort();
  }, [fetchBookings, retry]);

  const handlePayment = async (bookingId: string) => {
    if (payingId) return;

    try {
      setPayingId(bookingId);

      const response = await fetch(
        `${PAYMENT_API}/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingId }),
        }
      );

      const result = (await response.json()) as PaymentResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to start payment");
      }

      if (!result.checkoutUrl) {
        throw new Error("Stripe Checkout URL is missing");
      }

      window.location.href = result.checkoutUrl;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Payment failed"
      );

      setPayingId(null);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(bookings.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const pagedBookings = bookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-600" />

        <span className="text-gray-500">
          Loading your rentals...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        <Link
          href="/dashboard/customer"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </Link>

        <p className="font-medium">{error}</p>

        <button
          type="button"
          onClick={() => setRetry((previous) => previous + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Dashboard */}
        <Link
          href="/dashboard/customer"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Rentals
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage and track all your equipment rental bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRetry((previous) => previous + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Booking Count */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Package size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.length}
              </p>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center sm:p-12">
            <Package
              size={42}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No rentals found
            </h2>

            <p className="mt-2 text-gray-500">
              You have not booked any equipment yet.
            </p>
          </div>
        ) : (
          <>
            {/* Bookings Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-[1050px] divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-4">Equipment</th>
                    <th className="px-4 py-4">Start Date</th>
                    <th className="px-4 py-4">End Date</th>
                    <th className="px-4 py-4">Booking Date</th>
                    <th className="px-4 py-4">Amount</th>
                    <th className="px-4 py-4">Payment</th>
                    <th className="px-4 py-4">Booking</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {pagedBookings.map((booking) => {
                    const canPay =
                      booking.paymentStatus === "Pending" &&
                      (booking.bookingStatus === "Pending" ||
                        booking.bookingStatus === "Confirmed");

                    return (
                      <tr
                        key={booking._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {getEquipmentName(booking)}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {formatDate(booking.startDate)}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {formatDate(booking.endDate)}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {formatDate(booking.createdAt)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          ৳{formatAmount(booking.totalAmount)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                              paymentBadge[booking.paymentStatus] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                              bookingBadge[booking.bookingStatus] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedBooking(booking)
                              }
                              title="View booking details"
                              aria-label="View booking details"
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
                            >
                              <Eye size={16} />
                            </button>

                            {canPay && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePayment(booking._id)
                                }
                                disabled={payingId !== null}
                                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {payingId === booking._id ? (
                                  <>
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Redirecting
                                  </>
                                ) : (
                                  <>
                                    <CreditCard size={14} />
                                    Pay Now
                                  </>
                                )}
                              </button>
                            )}

                            {booking.paymentStatus === "Paid" && (
                              <span className="whitespace-nowrap text-xs font-semibold text-green-600">
                                Paid ✓
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Rentals pagination"
                className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, bookings.length)}{" "}
                  of {bookings.length} rentals
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((previous) => Math.max(1, previous - 1))
                    }
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setPage(number)}
                      aria-current={
                        currentPage === number ? "page" : undefined
                      }
                      className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        currentPage === number
                          ? "bg-blue-600 text-white"
                          : "border bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setPage((previous) =>
                        Math.min(totalPages, previous + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="booking-details-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Booking Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  ID: {selectedBooking._id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-600" size={22} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Equipment
                    </p>
                    <p className="font-semibold text-gray-900">
                      {getEquipmentName(selectedBooking)}
                    </p>
                    {selectedBooking.equipment?.category && (
                      <p className="text-xs text-gray-500">
                        {selectedBooking.equipment.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {formatDate(selectedBooking.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {formatDate(selectedBooking.endDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Booking Date</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {selectedBooking.quantity}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">
                    Payment Status
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      paymentBadge[selectedBooking.paymentStatus] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedBooking.paymentStatus}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Booking Status
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      bookingBadge[selectedBooking.bookingStatus] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedBooking.bookingStatus}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  ৳{formatAmount(selectedBooking.totalAmount)}
                </p>
              </div>

              {selectedBooking.contactNumber && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Contact Number
                    </p>
                    <p className="font-medium text-gray-800">
                      {selectedBooking.contactNumber}
                    </p>
                  </div>
                </div>
              )}

              {selectedBooking.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Delivery Address
                    </p>
                    <p className="font-medium text-gray-800">
                      {selectedBooking.deliveryAddress}
                    </p>
                  </div>
                </div>
              )}

              {selectedBooking.additionalNotes && (
                <div className="flex items-start gap-3">
                  <User size={18} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Additional Notes
                    </p>
                    <p className="font-medium text-gray-800">
                      {selectedBooking.additionalNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="mt-7 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
