
"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/bookings`;

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
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  customer?: { id: string; name?: string; email?: string };
  owner?: { id: string; name?: string; email?: string };
  equipment?: { id: string; name?: string; category?: string };
}

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

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB");

const rentalDays = (start: string, end: string) =>
  Math.max(
    1,
    Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/owner-bookings`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch bookings");
      }

      setBookings(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingStatus = async (
    bookingId: string,
    bookingStatus: "Confirmed" | "Cancelled"
  ) => {
    try {
      setUpdatingId(bookingId);

      const response = await fetch(
        `${API_URL}/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update booking");
      }

      toast.success(
        bookingStatus === "Confirmed"
          ? "Booking approved successfully!"
          : "Booking rejected successfully!"
      );

      // Update booking list immediately
      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, bookingStatus }
            : booking
        )
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-600" />
        <span className="text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={fetchBookings}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            My Equipment Rentals
          </h1>

          <p className="text-gray-600">
            Manage rental requests for your listed equipment.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold">
              No bookings found
            </h2>

            <p className="mt-2 text-gray-500">
              Customer bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Customer Information</th>
                  <th className="px-4 py-3">Equipment Information</th>
                  <th className="px-4 py-3">Rental Duration</th>
                  <th className="px-4 py-3">Required Quantity</th>
                  <th className="px-4 py-3">Booking Amount</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Booking Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="align-top transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {booking.customer?.name || "Customer"}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {booking.customer?.email}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {booking.contactNumber}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {booking.equipment?.name || "Equipment"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {booking.equipment?.category}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      <p className="font-medium text-gray-900">
                        {rentalDays(booking.startDate, booking.endDate)}{" "}
                        days
                      </p>

                      <p className="text-xs text-gray-500">
                        {formatDate(booking.startDate)} →{" "}
                        {formatDate(booking.endDate)}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      {booking.quantity}
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ৳{booking.totalAmount.toLocaleString("en-BD")}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          paymentBadge[booking.paymentStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          bookingBadge[booking.bookingStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {booking.bookingStatus === "Pending" ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() =>
                              handleBookingStatus(
                                booking._id,
                                "Confirmed"
                              )
                            }
                            disabled={updatingId === booking._id}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {updatingId === booking._id
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            onClick={() =>
                              handleBookingStatus(
                                booking._id,
                                "Cancelled"
                              )
                            }
                            disabled={updatingId === booking._id}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
