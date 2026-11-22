
"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

const API_URL = "/api/equipment";

interface ApiResponse {
  success?: boolean;
  message?: string;
}

const initialFormData = {
  name: "",
  description: "",
  category: "Photography Equipment",
  location: "",
  rentalPrice: "",
  rentalType: "Daily",
  availableQuantity: "",
  condition: "",
  brand: "",
  model: "",
  image: "",
  rentalTerms: "",
};

export default function AddEquipmentClient() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.image.trim()) {
      toast.error("Please upload an equipment image.");
      return;
    }

    const rentalPrice = Number(formData.rentalPrice);
    const availableQuantity = Number(formData.availableQuantity);

    if (!Number.isFinite(rentalPrice) || rentalPrice <= 0) {
      toast.error("Please enter a valid rental price.");
      return;
    }

    if (
      !Number.isInteger(availableQuantity) ||
      availableQuantity <= 0
    ) {
      toast.error("Please enter a valid available quantity.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          rentalPrice,
          availableQuantity,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to add equipment."
        );
      }

      toast.success(
        data.message ||
          "Equipment added successfully! Waiting for admin approval.",
        {
          duration: 3000,
          position: "top-right",
        }
      );

      setFormData({ ...initialFormData });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/dashboard/owner"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Owner Dashboard
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Add Equipment
      </h1>

      <p className="mb-8 text-gray-500">
        Add your equipment and make it available for rent.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block font-medium">
            Equipment Name
          </label>
          <input
            className={inputClass}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Canon EOS 90D"
            minLength={3}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Description
          </label>
          <textarea
            className={inputClass}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your equipment..."
            rows={4}
            minLength={10}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Category
          </label>
          <select
            className={inputClass}
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option>Construction Equipment</option>
            <option>Photography Equipment</option>
            <option>Vehicles & Transportation</option>
            <option>Agriculture Equipment</option>
            <option>Electronics</option>
            <option>Event Equipment</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Location
          </label>
          <input
            className={inputClass}
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Dhaka"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Rental Price (৳)
            </label>
            <input
              className={inputClass}
              type="number"
              name="rentalPrice"
              value={formData.rentalPrice}
              onChange={handleChange}
              min="1"
              step="any"
              placeholder="1500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Rental Type
            </label>
            <select
              className={inputClass}
              name="rentalType"
              value={formData.rentalType}
              onChange={handleChange}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Available Quantity
          </label>
          <input
            className={inputClass}
            type="number"
            name="availableQuantity"
            value={formData.availableQuantity}
            onChange={handleChange}
            min="1"
            step="1"
            placeholder="2"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Condition
            </label>
            <input
              className={inputClass}
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              placeholder="Excellent"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Brand
            </label>
            <input
              className={inputClass}
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Canon"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Model
          </label>
          <input
            className={inputClass}
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="EOS 90D"
            required
          />
        </div>

        <ImageUpload
          value={formData.image}
          onChange={(url) =>
            setFormData((prev) => ({
              ...prev,
              image: url,
            }))
          }
          label="Equipment Image"
          required
        />

        <div>
          <label className="mb-2 block font-medium">
            Rental Terms
          </label>
          <textarea
            className={inputClass}
            name="rentalTerms"
            value={formData.rentalTerms}
            onChange={handleChange}
            placeholder="Handle carefully and return on time."
            rows={3}
            minLength={5}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Adding Equipment..." : "Add Equipment"}
        </button>
      </form>
    </div>
  );
}
