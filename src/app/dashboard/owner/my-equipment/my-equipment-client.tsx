
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
  ArrowLeft,
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

interface EquipmentResponse {
  success?: boolean;
  message?: string;
  equipment?: Equipment[];
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || ""}/equipment`;

export default function MyEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchEquipment = useCallback(async (signal?: AbortSignal) => {
    try {
      if (!API_URL || API_URL === "/equipment") {
        throw new Error("API URL is not configured.");
      }

      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/my-equipment`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
      });

      const data = (await response.json()) as EquipmentResponse;

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch equipment.");
      }

      if (!Array.isArray(data.equipment)) {
        throw new Error("Invalid equipment data received.");
      }

      setEquipment(data.equipment);
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
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchEquipment(controller.signal);

    return () => controller.abort();
  }, [fetchEquipment]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEquipment();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment?"
    );

    if (!confirmed || deletingId) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete equipment.");
      }

      setEquipment((prev) =>
        prev.filter((item) => item._id !== id)
      );

      setMessage("Equipment deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed."
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

  const formatAmount = (amount: number) =>
    Number(amount || 0).toLocaleString("en-BD");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/dashboard/owner"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Owner Dashboard
          </Link>

          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-500">
              Loading your equipment...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Owner Dashboard */}
        <Link
          href="/dashboard/owner"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Owner Dashboard
        </Link>

        {/* Header */}
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
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <Link
              href="/dashboard/owner/add-equipment"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Total Equipment",
              value: equipment.length,
              color: "text-indigo-600",
            },
            {
              title: "Approved",
              value: equipment.filter(
                (item) => item.status === "Approved"
              ).length,
              color: "text-green-600",
            },
            {
              title: "Pending",
              value: equipment.filter(
                (item) => item.status === "Pending"
              ).length,
              color: "text-yellow-600",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {stat.title}
              </p>

              <h2 className={`mt-2 text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Messages */}
        {message && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-3 text-sm font-semibold text-red-700 underline disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Equipment List */}
        {!error && equipment.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white px-6 py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />

            <h2 className="mt-4 text-xl font-semibold">
              No Equipment Found
            </h2>

            <p className="mt-2 text-gray-500">
              You have not added any equipment yet.
            </p>

            <Link
              href="/dashboard/owner/add-equipment"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
            >
              Add Your First Equipment
            </Link>
          </div>
        ) : !error ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* Image */}
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
                  {/* Name and Status */}
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

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {item.category}
                    </p>

                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {item.location}
                    </p>

                    <p>
                      <span className="font-medium">Brand:</span>{" "}
                      {item.brand} | {item.model}
                    </p>

                    <p>
                      <span className="font-medium">Condition:</span>{" "}
                      {item.condition}
                    </p>

                    <p>
                      <span className="font-medium">Quantity:</span>{" "}
                      {item.availableQuantity}
                    </p>

                    <p className="font-bold text-indigo-600">
                      ৳{formatAmount(item.rentalPrice)} / {item.rentalType}
                    </p>
                  </div>

                  {/* Edit */}
                  <Link
                    href={`/dashboard/owner/edit-equipment/${item._id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Equipment
                  </Link>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId !== null}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        ) : null}
      </div>
    </div>
  );
}
