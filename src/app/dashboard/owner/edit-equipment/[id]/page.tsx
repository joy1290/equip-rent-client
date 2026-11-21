
"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Save } from "lucide-react";

import ImageUpload from "@/components/ui/image-upload";

interface EquipmentForm {
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: string;
  rentalType: string;
  availableQuantity: string;
  condition: string;
  brand: string;
  model: string;
  image: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

const initialForm: EquipmentForm = {
  name: "",
  description: "",
  category: "",
  location: "",
  rentalPrice: "",
  rentalType: "Daily",
  availableQuantity: "",
  condition: "Good",
  brand: "",
  model: "",
  image: "",
};

// Edit Equipment Content
function EditEquipmentContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [form, setForm] = useState<EquipmentForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch Equipment
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/my-equipment`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load equipment.");
        }

        const item = (data.equipment ?? []).find(
          (equipment: { _id: string }) => equipment._id === id
        );

        if (!item) {
          throw new Error(
            "Equipment not found or you do not have permission."
          );
        }

        setForm({
          name: item.name ?? "",
          description: item.description ?? "",
          category: item.category ?? "",
          location: item.location ?? "",
          rentalPrice: String(item.rentalPrice ?? ""),
          rentalType: item.rentalType ?? "Daily",
          availableQuantity: String(item.availableQuantity ?? ""),
          condition: item.condition ?? "Good",
          brand: item.brand ?? "",
          model: item.model ?? "",
          image: item.image ?? "",
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
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

  // Handle Form Changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Updated Equipment
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    setError("");
    setMessage("");

    const rentalPrice = Number(form.rentalPrice);
    const availableQuantity = Number(form.availableQuantity);

    if (!Number.isFinite(rentalPrice) || rentalPrice <= 0) {
      setError("Please enter a valid rental price.");
      return;
    }

    if (
      !Number.isInteger(availableQuantity) ||
      availableQuantity < 1
    ) {
      setError("Please enter a valid available quantity.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        rentalPrice,
        availableQuantity,
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update equipment."
        );
      }

      setMessage(
        "Equipment updated successfully! Sent for admin approval."
      );

      router.push("/dashboard/owner/my-equipment");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">
          Loading equipment...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Back Link */}
        <Link
          href="/dashboard/owner/my-equipment"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Equipment
        </Link>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">

          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Edit Equipment
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update your equipment information.
          </p>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div
              role="status"
              className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {/* Equipment Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            {/* Equipment Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Equipment Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description *
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Equipment Information */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category *
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location *
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rental Price (৳) *
                </label>

                <input
                  type="number"
                  name="rentalPrice"
                  value={form.rentalPrice}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rental Type *
                </label>

                <select
                  name="rentalType"
                  value={form.rentalType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Available Quantity *
                </label>

                <input
                  type="number"
                  name="availableQuantity"
                  value={form.availableQuantity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Condition *
                </label>

                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Brand
                </label>

                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Model
                </label>

                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Image Upload (imgbb) */}
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
              label="Equipment Image"
              required
            />

            {/* Update Button */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {saving ? "Updating..." : "Update Equipment"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

// Main Page with Suspense
export default function EditEquipmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">
            Loading edit page...
          </span>
        </div>
      }
    >
      <EditEquipmentContent />
    </Suspense>
  );
}
