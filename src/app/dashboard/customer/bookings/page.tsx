
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/bookings`;
const PAYMENT_API = `${process.env.NEXT_PUBLIC_API_URL}/payments`;

interface Booking {
  _id: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  equipment?: {
    id: string;
    name?: string;
    image?: string;
    category?: string;
  };
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

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/my-bookings`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch bookings");
      }

      setBookings(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = async (bookingId: string) => {
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

      const result = await response.json();

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-600" />
        <span className="text-gray-500">Loading your rentals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
        <button
          onClick={fetchBookings}
          className="ml-3 font-semibold underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Rentals
          </h1>
          <p className="mt-2 text-gray-500">
            All your equipment rental bookings in one place.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No rentals found
            </h2>
            <p className="mt-2 text-gray-500">
              You have not booked any equipment yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Equipment Name</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Booking Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Booking Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const canPay =
                    booking.paymentStatus === "Pending" &&
                    (booking.bookingStatus === "Pending" ||
                      booking.bookingStatus === "Confirmed");

                  return (
                    <tr
                      key={booking._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {booking.equipment?.name || "Equipment"}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(booking.startDate)}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(booking.endDate)}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(booking.createdAt)}
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
                        {canPay ? (
                          <button
                            onClick={() => handlePayment(booking._id)}
                            disabled={payingId === booking._id}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {payingId === booking._id
                              ? "Redirecting..."
                              : "Pay Now"}
                          </button>
                        ) : booking.paymentStatus === "Paid" ? (
                          <span className="text-xs font-semibold text-green-600">
                            Paid ✓
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
