
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-5" />

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-7">
          Your payment was not completed. You can return to your bookings
          and try again.
        </p>

        <Link
          href="/dashboard/customer/bookings"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
