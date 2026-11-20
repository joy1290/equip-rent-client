
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
}

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
        <p className="text-gray-500">Loading your bookings...</p>
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
            My Bookings
          </h1>
          <p className="mt-2 text-gray-500">
            View and manage your equipment rental bookings.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No bookings found
            </h2>
            <p className="mt-2 text-gray-500">
              You have not booked any equipment yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-sm text-gray-500">
                      Booking ID
                    </p>
                    <p className="break-all font-semibold text-gray-800">
                      {booking._id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                      {booking.bookingStatus}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="my-5 grid gap-5 border-y border-gray-100 py-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500">Equipment ID</p>
                    <p className="mt-1 break-all font-medium text-gray-800">
                      {booking.equipmentId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {booking.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm text-gray-500">
                    Booked on:{" "}
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-xl font-bold text-indigo-600">
                    ৳{booking.totalAmount.toLocaleString("en-BD")}
                  </p>
                </div>

                {booking.bookingStatus === "Confirmed" &&
                  booking.paymentStatus === "Pending" && (
                    <div className="mt-5 border-t pt-5">
                      <button
                        onClick={() => handlePayment(booking._id)}
                        disabled={payingId === booking._id}
                        className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {payingId === booking._id
                          ? "Redirecting..."
                          : "Pay Now"}
                      </button>
                    </div>
                  )}

                {booking.paymentStatus === "Paid" && (
                  <p className="mt-5 border-t pt-5 font-semibold text-green-600">
                    Payment Completed
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
