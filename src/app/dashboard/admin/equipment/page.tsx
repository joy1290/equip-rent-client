
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Search,
  RefreshCw,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
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
  createdAt: string;
}

type StatusFilter = "All" | "Pending" | "Approved" | "Rejected";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/all`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch equipment.");
      }

      setEquipment(data.equipment || []);
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

  // Delete Equipment
  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete equipment.");
      }

      setEquipment((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setMessage(data.message || "Equipment deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText) ||
        item.brand.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [equipment, search, statusFilter]);

  const statusOptions: StatusFilter[] = [
    "All",
    "Pending",
    "Approved",
    "Rejected",
  ];

  const statusStyle = (status: Equipment["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              All Equipment
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage and monitor all equipment submitted by owners.
            </p>
          </div>

          <button
            onClick={fetchEquipment}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Equipment</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {equipment.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, brand, category or location..."
                className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Status" : status}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment List */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
            <Package className="mx-auto h-14 w-14 text-gray-300" />

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No Equipment Found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Equipment List
              </h2>

              <span className="text-sm text-gray-500">
                {filteredEquipment.length} result(s)
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredEquipment.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-52 bg-gray-100">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-14 w-14 text-gray-400" />
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${statusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.brand} {item.model}
                      </p>
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-gray-500">
                      {item.description}
                    </p>

                    <div className="space-y-3 border-t pt-4 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        {item.category}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        {item.location}
                      </p>

                      <p className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-500" />
                        Available Quantity: {item.availableQuantity}
                      </p>

                      <p className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-indigo-500" />
                        Condition: {item.condition}
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        Rental Type: {item.rentalType}
                      </p>

                      <p className="pt-2 text-lg font-bold text-indigo-600">
                        ৳{item.rentalPrice.toLocaleString("en-BD")} / {item.rentalType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-t pt-4 text-xs text-gray-400">
                      {item.status === "Approved" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : item.status === "Rejected" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}

                      Added on{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </div>

                    {/* Delete Button */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        disabled={deletingId !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
