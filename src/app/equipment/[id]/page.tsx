"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Heart, Loader2, MapPin, ShieldCheck, X } from "lucide-react";

import RoleGuard from "@/components/auth/role-guard";
import { useSession } from "@/lib/auth-client";

interface OwnerInfo {
  name?: string;
  email?: string;
  image?: string;
}

interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  rentalTerms: string;
  owner?: OwnerInfo | null;
}

interface BookingForm {
  startDate: string;
  endDate: string;
  quantity: string;
  contactNumber: string;
  deliveryAddress: string;
  additionalNotes: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const today = () => new Date().toLocaleDateString("en-CA");

// Equipment Details Content
function EquipmentDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const id = params.id;

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role ?? "customer";
  const isCustomer = role === "customer";

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  // Booking modal
  const [showBooking, setShowBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<BookingForm>({
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

        const response = await fetch(`${API_URL}/equipment/${id}`, {
          signal: controller.signal,
        });

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

    return () => {
      controller.abort();
    };
  }, [id]);

  // Load favorites (customers only) to show the current state
  useEffect(() => {
    if (!id || !isCustomer || !user) return;

    const controller = new AbortController();

    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          // Handle unauthorized gracefully - redirect to login
          if (session?.user) {
            // Show error but don't redirect if already logged in
            toast.error("Could not load favorites. Please try again.");
          }
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.favorites)) {
          setIsFavorite(
            data.favorites.some(
              (item: { _id: string }) => item._id === id
            )
          );
        }
      } catch (err) {
        // Favorites are non-critical — ignore load failures
        console.error("Favorite load error:", err);
      }
    };

    fetchFavorites();

    return () => controller.abort();
  }, [id, isCustomer, user]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (favoriteBusy || !user) return;

    if (!isCustomer) {
      toast.error("Only customers can save favorites.");
      return;
    }

    setFavoriteBusy(true);

    try {
      const response = await fetch(`${API_URL}/favorites/${id}`, {
        method: isFavorite ? "DELETE" : "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update favorites.");
      }

      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite
          ? "Removed from favorites."
          : "Added to favorites!"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setFavoriteBusy(false);
    }
  };

  // Calculate total amount (daily / weekly / monthly × quantity)
  const totalAmount = useMemo(() => {
    if (!equipment || !form.startDate || !form.endDate) return 0;

    const start = new Date(`${form.startDate}T00:00:00`);
    const end = new Date(`${form.endDate}T00:00:00`);

    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days <= 0) return 0;

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) return 0;

    let duration = days;
    const rentalType = equipment.rentalType.toLowerCase();

    if (rentalType === "weekly") {
      duration = Math.ceil(days / 7);
    } else if (rentalType === "monthly") {
      duration = Math.ceil(days / 30);
    }

    return equipment.rentalPrice * duration * quantity;
  }, [equipment, form.startDate, form.endDate, form.quantity]);

  // Book Now → open the booking modal (login + role checked)
  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/equipment/${id}`)}`);
      return;
    }

    if (!isCustomer) {
      toast.error("Only customer accounts can book equipment.");
      return;
    }

    setFormError("");
    setShowBooking(true);
  };

  // Confirm booking → create booking → redirect to Stripe Checkout
  const confirmBooking = async () => {
    setFormError("");

    if (!equipment) return;

    if (!form.startDate || !form.endDate) {
      setFormError("Please select both start and end dates.");
      return;
    }

    if (
      new Date(`${form.endDate}T00:00:00`) <=
      new Date(`${form.startDate}T00:00:00`)
    ) {
      setFormError("End date must be after start date.");
      return;
    }

    const quantity = Number(form.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > equipment.availableQuantity
    ) {
      setFormError(
        `Quantity must be between 1 and ${equipment.availableQuantity}.`
      );
      return;
    }

    if (!form.contactNumber.trim()) {
      setFormError("Please enter your contact number.");
      return;
    }

    if (!form.deliveryAddress.trim()) {
      setFormError("Please enter your delivery address.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create the booking (server validates availability + total)
      const bookingResponse = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        // Handle specific errors gracefully
        const errorMsg = bookingData.message || "Booking failed.";
        
        // Provide helpful user feedback based on error type
        if (!bookingData.success) {
          // Server validation failed - show the specific error
          toast.error(errorMsg);
        } else if (errorMsg.includes("clipboard") || errorMsg.includes("permission")) {
          toast.error("System error. Please try again or contact support.");
        } else {
          toast.error(errorMsg);
        }
        setSubmitting(false);
        return;
      }

      // 2. Create the Stripe Checkout session for this booking
      const checkoutResponse = await fetch(
        `${API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ bookingId: bookingData.bookingId }),
        }
      );

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        const errorMsg = checkoutData.message || "Could not start payment.";
        
        if (errorMsg.includes("clipboard") || errorMsg.includes("permission")) {
          toast.error("Payment system error. Please try again or contact support.");
        } else if (!checkoutData.success) {
          // Payment session failed - show the specific error
          toast.error(errorMsg);
        } else {
          toast.error(errorMsg);
        }
        setSubmitting(false);
        return;
      }

      if (!checkoutData.checkoutUrl) {
        toast.error("Payment session was not created.");
        setSubmitting(false);
        return;
      }

      toast.success("Booking created! Redirecting to secure payment...");

      // 3. Redirect to Stripe Checkout
      window.location.href = checkoutData.checkoutUrl;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setFormError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Loader2 className="mr-2 animate-spin text-blue-600" />
        <span className="text-gray-600">
          Loading equipment details...
        </span>
      </div>
    );
  }

  // Error State
  if (error || !equipment) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-500">
          {error || "Equipment not found"}
        </p>

        <button
          onClick={() => router.push("/equipment")}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Back to Equipment
        </button>
      </div>
    );
  }

  const owner = equipment.owner;
  const inStock = equipment.availableQuantity > 0;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 font-medium text-blue-600 hover:underline"
        >
          ← Back
        </button>

        {/* Equipment Details */}
        <div className="grid overflow-hidden rounded-2xl bg-white shadow-md md:grid-cols-2">

          {/* Equipment Image */}
          <div className="min-h-72 bg-gray-100 md:min-h-full">
            <img
              src={equipment.image}
              alt={equipment.name}
              className="h-72 w-full object-cover sm:h-96 md:h-full"
            />
          </div>

          {/* Equipment Information */}
          <div className="p-5 sm:p-8 lg:p-10">

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                {equipment.category}
              </span>

              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                }`}
              >
                {inStock ? "Available" : "Out of Stock"}
              </span>
            </div>

            <h1 className="mt-4 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
              {equipment.name}
            </p>

            <p className="mt-3 leading-relaxed text-gray-600">
              {equipment.description}
            </p>

            {/* Equipment Specifications */}
            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2 sm:text-base">
              <p>
                <strong>Brand:</strong> {equipment.brand}
              </p>

              <p>
                <strong>Model:</strong> {equipment.model}
              </p>

              <p>
                <strong>Condition:</strong> {equipment.condition}
              </p>

              <p className="flex items-center gap-1">
                <MapPin size={15} className="text-blue-600" />
                {equipment.location}
              </p>

              <p>
                <strong>Available Quantity:</strong>{" "}
                {equipment.availableQuantity}
              </p>

              <p>
                <strong>Rental Type:</strong> {equipment.rentalType}
              </p>
            </div>

            {/* Owner Information */}
            <div className="mt-6 flex items-center gap-3 rounded-xl border bg-gray-50 p-4">
              {owner?.image ? (
                <img
                  src={owner.image}
                  alt={owner.name || "Owner"}
                  className="h-11 w-11 rounded-full object-cover"
                )
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {(owner?.name || "O").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="flex items-center gap-1 font-semibold text-gray-900">
                  {owner?.name || "Equipment Owner"}
                  <ShieldCheck size={15} className="text-blue-600" />
                </p>

                <p className="truncate text-sm text-gray-500">
                  {owner?.email}
                </p>
              </div>
            </div>

            {/* Rental Information */}
            <div className="mt-7 border-t pt-6">

              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="text-2xl font-bold text-blue-600 sm:text-3xl">
                  ৳{equipment.rentalPrice}

                  <span className="text-base font-normal text-gray-500">
                    /{equipment.rentalType}
                  </span>
                </p>

                {/* Favorite (customers only) */}
                {isCustomer && (
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={favoriteBusy}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                      isFavorite
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                    {isFavorite ? "Saved" : "Add to Favorites"}
                  </button>
                )}

                {/* Rental Terms */}
                <div className="mt-5">
                  <h2 className="font-semibold text-gray-900">
                    Rental Terms & Conditions
                  </h2>

                  <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-600">
                    {equipment.rentalTerms}
                  </p>
                </div>

                {/* Booking Button */}
                <button
                  disabled={!inStock}
                  onClick={handleBookNow}
                  className="mt-7 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {inStock ? "Book Now" : "Not Available"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBooking && equipment && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
            onClick={() => {
              if (!submitting) setShowBooking(false);
            }}
          >
            <div
              className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Book Equipment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {equipment.name} · ৳{equipment.rentalPrice}/
                    {equipment.rentalType}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  disabled={submitting}
                  onClick={() => setShowBooking(false)}
                  className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-4">
                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                  >
                    {formError}
                  </p>
                )

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Rental Start Date *
                    </label>

                    <input
                      type="date"
                      min={today()}
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Rental End Date *
                    </label>

                    <input
                      type="date"
                      min={form.startDate || today()}
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Required Quantity *
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={equipment.availableQuantity}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Contact Number *
                    </label>

                    <input
                      type="tel"
                      value={form.contactNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contactNumber: e.target.value,
                        })
                      }
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Delivery Address *
                  </label>

                  <textarea
                    rows={2}
                    value={form.deliveryAddress}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        deliveryAddress: e.target.value,
                      })
                    }
                    placeholder="Enter your complete delivery address"
                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>

                  <textarea
                    rows={2}
                    value={form.additionalNotes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        additionalNotes: e.target.value,
                      })
                    }
                    placeholder="Any additional information..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Calculated Total */}
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-gray-600">
                    Total Rental Amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    ৳{totalAmount.toLocaleString("en-BD")}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Duration × quantity, calculated and validated by the
                    server.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowBooking(false)}
                  className="rounded-lg border px-5 py-2.5 font-medium transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={submitting || totalAmount <= 0}
                  onClick={confirmBooking}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {submitting && (
                    <Loader2 size={17} className="animate-spin" />
                  )}
                  {submitting
                    ? "Redirecting to payment..."
                    : "Confirm & Pay with Stripe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  );
}

// Main Page with Suspense (RoleGuard + hooks need the boundary)
export default function EquipmentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Loader2 className="mr-2 animate-spin text-blue-600" />
          <span className="text-gray-600">
            Loading equipment details...
          </span>
        </div>
      }
    >
      <RoleGuard>
        <EquipmentDetailsContent />
      </RoleGuard>
    </Suspense>
  );
}