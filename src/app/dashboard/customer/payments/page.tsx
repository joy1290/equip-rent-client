
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  CreditCard,
  Loader2,
  RefreshCw,
  Receipt,
} from "lucide-react";

interface Payment {
  _id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  status: "Pending" | "Paid" | "Failed" | "Refunded";
  createdAt: string;
}

export default function PaymentHistoryPage() {
  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

     const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/payments/history`,
  {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }
);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load payment history."
        );
      }

      setPayments(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPayments();
    } else if (!sessionLoading) {
      setLoading(false);
    }
  }, [session, sessionLoading]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Please Login</h1>
        <p className="mt-2 text-gray-600">
          Login to view your payment history.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="mt-2 text-gray-600">
              View all your EquipRent payment transactions.
            </p>
          </div>

          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="text-indigo-600" />
              <p className="text-sm text-gray-500">
                Total Transactions
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {payments.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Receipt className="text-green-600" />
              <p className="text-sm text-gray-500">
                Successful Payments
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {payments.filter((p) => p.status === "Paid").length}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">
              Transaction Records
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CreditCard
                size={42}
                className="mx-auto text-gray-300"
              />
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No Payment Records Found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Your completed payments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Booking ID</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="max-w-[180px] truncate px-6 py-4 font-medium">
                        {payment.transactionId}
                      </td>
                      <td className="px-6 py-4">
                        {payment.bookingId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            payment.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : payment.status === "Refunded"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
