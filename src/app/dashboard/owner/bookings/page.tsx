
"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
}

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
      <div className="p-8 text-center text-gray-600">
        Loading bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={fetchBookings}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Booking Management
          </h1>

          <p className="text-gray-600">
            Manage your equipment rental bookings.
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
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="break-all text-lg font-bold">
                    Booking #{booking._id}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      booking.bookingStatus === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.bookingStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">Equipment ID</p>
                    <p className="break-all font-medium">
                      {booking.equipmentId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Customer ID</p>
                    <p className="break-all font-medium">
                      {booking.customerId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{booking.quantity}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-bold text-indigo-600">
                      ৳{booking.totalAmount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{booking.contactNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">
                      {booking.deliveryAddress}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">{booking.paymentStatus}</p>
                  </div>
                </div>

                {booking.additionalNotes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Additional Notes
                    </p>
                    <p className="font-medium">
                      {booking.additionalNotes}
                    </p>
                  </div>
                )}

                {booking.bookingStatus === "Pending" && (
                  <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                    <button
                      onClick={() =>
                        handleBookingStatus(booking._id, "Confirmed")
                      }
                      disabled={updatingId === booking._id}
                      className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Approve Booking"}
                    </button>

                    <button
                      onClick={() =>
                        handleBookingStatus(booking._id, "Cancelled")
                      }
                      disabled={updatingId === booking._id}
                      className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Reject Booking"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
