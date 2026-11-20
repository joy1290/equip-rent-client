
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

interface Equipment {
  _id: string;
  name: string;
  image: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Booking Form Component
function BookingContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    quantity: "1",
    contactNumber: "",
    deliveryAddress: "",
    additionalNotes: "",
  });

  // Fetch Equipment Details
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/equipment/${id}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Equipment not found");
        }

        setEquipment(data.equipment);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEquipment();

    return () => controller.abort();
  }, [id]);

  // Calculate Total Amount
  const totalAmount = useMemo(() => {
    if (!equipment || !form.startDate || !form.endDate) {
      return 0;
    }

    const start = new Date(`${form.startDate}T00:00:00`);
    const end = new Date(`${form.endDate}T00:00:00`);

    const days = Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (days <= 0) return 0;

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return 0;
    }

    let duration = days;

    const rentalType = equipment.rentalType.toLowerCase();

    if (rentalType === "weekly") {
      duration = Math.ceil(days / 7);
    } else if (rentalType === "monthly") {
      duration = Math.ceil(days / 30);
    }

    return equipment.rentalPrice * duration * quantity;
  }, [
    equipment,
    form.startDate,
    form.endDate,
    form.quantity,
  ]);

  // Submit Booking
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (!equipment) {
      setError("Equipment information is unavailable.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (
      new Date(`${form.endDate}T00:00:00`) <=
      new Date(`${form.startDate}T00:00:00`)
    ) {
      setError("End date must be after start date.");
      return;
    }

    const quantity = Number(form.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > equipment.availableQuantity
    ) {
      setError("Please enter a valid available quantity.");
      return;
    }

    if (!form.contactNumber.trim()) {
      setError("Please enter your contact number.");
      return;
    }

    if (!form.deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          equipmentId: id,
          startDate: form.startDate,
          endDate: form.endDate,
          quantity,
          contactNumber: form.contactNumber.trim(),
          deliveryAddress: form.deliveryAddress.trim(),
          additionalNotes: form.additionalNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setSuccess("Booking request submitted successfully!");

      router.push("/dashboard/customer/bookings");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Loader2 className="mr-2 animate-spin text-indigo-600" />
        <span className="text-gray-600">
          Loading booking details...
        </span>
      </div>
    );
  }

  // Equipment Not Found
  if (!equipment) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-500">
          {error || "Equipment not found."}
        </p>

        <button
          onClick={() => router.push("/equipment")}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-700"
        >
          Back to Equipment
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">

          {/* Page Header */}
          <div className="border-b p-5 sm:p-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Book Equipment
            </h1>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Complete the form to request your equipment rental.
            </p>
          </div>

          {/* Equipment Information */}
          <div className="flex flex-col gap-4 border-b bg-gray-50 p-5 sm:flex-row sm:items-center sm:p-6">
            <img
              src={equipment.image}
              alt={equipment.name}
              className="h-40 w-full rounded-lg object-cover sm:h-24 sm:w-24"
            />

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                {equipment.name}
              </h2>

              <p className="mt-1 font-semibold text-indigo-600">
                ৳{equipment.rentalPrice} / {equipment.rentalType}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Available: {equipment.availableQuantity}
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-5 sm:p-6"
          >
            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* Success Message */}
            {success && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
              >
                {success}
              </p>
            )}

            {/* Date and Quantity Fields */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date *
                </label>

                <input
                  type="date"
                  required
                  min={new Date().toLocaleDateString("en-CA")}
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Date *
                </label>

                <input
                  type="date"
                  required
                  min={
                    form.startDate ||
                    new Date().toLocaleDateString("en-CA")
                  }
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Quantity *
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  max={equipment.availableQuantity}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Contact Number *
                </label>

                <input
                  type="tel"
                  required
                  value={form.contactNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contactNumber: e.target.value,
                    })
                  }
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Delivery Address *
              </label>

              <textarea
                required
                rows={3}
                value={form.deliveryAddress}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryAddress: e.target.value,
                  })
                }
                placeholder="Enter your complete delivery address"
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Additional Notes
              </label>

              <textarea
                rows={3}
                value={form.additionalNotes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    additionalNotes: e.target.value,
                  })
                }
                placeholder="Any additional information..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Total Amount */}
            <div className="rounded-xl bg-indigo-50 p-4 sm:p-5">
              <p className="text-sm text-gray-600">
                Estimated Total Amount
              </p>

              <p className="mt-1 text-2xl font-bold text-indigo-700 sm:text-3xl">
                ৳{totalAmount.toLocaleString("en-BD")}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Final amount is calculated and validated by the server.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                totalAmount <= 0 ||
                equipment.availableQuantity <= 0
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting && (
                <Loader2 size={18} className="animate-spin" />
              )}

              {submitting
                ? "Submitting..."
                : "Confirm Booking"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}

// Main Booking Page with Suspense
export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Loader2 className="mr-2 animate-spin text-indigo-600" />
          <span className="text-gray-600">
            Loading booking page...
          </span>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
