
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Pencil,
} from "lucide-react";

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
  status: "Pending" | "Approved" | "Rejected";
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

export default function MyEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/my-equipment`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch equipment.");
      }

      setEquipment(data.equipment ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete equipment.");
      }

      setEquipment((prev) => prev.filter((item) => item._id !== id));
      setMessage("Equipment deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Equipment
            </h1>
            <p className="mt-2 text-gray-500">
              Manage all your rental equipment in one place.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchEquipment}
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-medium hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              href="/dashboard/owner/add-requirement"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Total Equipment",
              value: equipment.length,
              color: "text-indigo-600",
            },
            {
              title: "Approved",
              value: equipment.filter((item) => item.status === "Approved").length,
              color: "text-green-600",
            },
            {
              title: "Pending",
              value: equipment.filter((item) => item.status === "Pending").length,
              color: "text-yellow-600",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h2 className={`mt-2 text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {message && (
          <p className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {equipment.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white px-6 py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">
              No Equipment Found
            </h2>
            <p className="mt-2 text-gray-500">
              You have not added any equipment yet.
            </p>
            <Link
              href="/dashboard/owner/add-requirement"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-white"
            >
              Add Your First Equipment
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="h-48 bg-gray-100">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>Category: {item.category}</p>
                    <p>Location: {item.location}</p>
                    <p>
                      Brand: {item.brand} | Model: {item.model}
                    </p>
                    <p>Quantity: {item.availableQuantity}</p>
                    <p className="font-bold text-indigo-600">
                      ৳{item.rentalPrice.toLocaleString("en-BD")} / {item.rentalType}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/owner/edit-equipment/${item._id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Equipment
                  </Link>

                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === item._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deletingId === item._id
                      ? "Deleting..."
                      : "Delete Equipment"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
