
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

type PaymentState = "verifying" | "success" | "failed";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<PaymentState>("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = new URLSearchParams(window.location.search).get(
        "session_id"
      );

      if (!sessionId) {
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          { credentials: "include" }
        );

        const result = await response.json();

        setStatus(
          response.ok && result.success && result.paymentStatus === "Paid"
            ? "success"
            : "failed"
        );
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        {status === "verifying" && (
          <>
            <Loader2 className="w-20 h-20 text-indigo-600 mx-auto mb-5 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying Payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-7">
              Your payment has been verified successfully.
              Thank you for using EquipRent!
            </p>
            <Link
              href="/dashboard/customer/bookings"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              View My Bookings
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-5" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Payment Not Verified
            </h1>
            <p className="text-gray-600 mb-7">
              We could not verify your payment yet. Please check your bookings
              or contact support.
            </p>
            <Link
              href="/dashboard/customer/bookings"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              View My Bookings
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
