
"use client";

import { useState, FormEvent } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

export default function AddEquipmentPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
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
  });

  const handleChange = (
    e: React.ChangeEvent<
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
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          rentalPrice: Number(formData.rentalPrice),
          availableQuantity: Number(formData.availableQuantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add equipment");
      }

      setMessage("Equipment added successfully!");

      setFormData({
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
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Add Equipment</h1>
      <p className="mb-8 text-gray-500">
        Add your equipment and make it available for rent.
      </p>

      {message && (
        <p className="mb-5 rounded-lg bg-gray-100 p-4 text-sm">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block font-medium">Equipment Name</label>
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
          <label className="mb-2 block font-medium">Description</label>
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
          <label className="mb-2 block font-medium">Category</label>
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
          <label className="mb-2 block font-medium">Location</label>
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
              Rental Price
            </label>
            <input
              className={inputClass}
              type="number"
              name="rentalPrice"
              value={formData.rentalPrice}
              onChange={handleChange}
              min="1"
              placeholder="1500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Rental Type</label>
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
            placeholder="2"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">Condition</label>
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
            <label className="mb-2 block font-medium">Brand</label>
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
          <label className="mb-2 block font-medium">Model</label>
          <input
            className={inputClass}
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="EOS 90D"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Image URL</label>
          <input
            className={inputClass}
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Rental Terms</label>
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
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Adding Equipment..." : "Add Equipment"}
        </button>
      </form>
    </div>
  );
}
