
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
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
  Eye,
  X,
  ShieldCheck,
  AlertCircle,
  Filter,
  Pencil,
  Save,
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
  rentalTerms?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

interface EquipmentStats {
  totalEquipment: number;
  pendingEquipment: number;
  approvedEquipment: number;
  rejectedEquipment: number;
}

type StatusFilter = "All" | "Pending" | "Approved" | "Rejected";

type EquipmentFormData = {
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
  rentalTerms: string;
};

const initialEditForm: EquipmentFormData = {
  name: "",
  description: "",
  category: "Construction Equipment",
  location: "",
  rentalPrice: "",
  rentalType: "Daily",
  availableQuantity: "1",
  condition: "",
  brand: "",
  model: "",
  image: "",
  rentalTerms: "",
};

const equipmentCategories = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | null>(null);

  // Edit Equipment State
  const [editingEquipment, setEditingEquipment] =
    useState<Equipment | null>(null);

  const [editForm, setEditForm] =
    useState<EquipmentFormData>(initialEditForm);

  const [savingEdit, setSavingEdit] = useState(false);

  const [stats, setStats] = useState<EquipmentStats>({
    totalEquipment: 0,
    pendingEquipment: 0,
    approvedEquipment: 0,
    rejectedEquipment: 0,
  });

  // Fetch All Equipment
  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/all`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch equipment.");
      }

      setEquipment(
        Array.isArray(data.equipment) ? data.equipment : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Equipment Statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch statistics."
        );
      }

      setStats(data.statistics);
    } catch (err) {
      console.error("Statistics error:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchEquipment(), fetchStats()]);
  }, [fetchEquipment, fetchStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Categories
  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          equipment
            .map((item) => item.category)
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [equipment]);

  // Search and Filter
  const filteredEquipment = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesSearch =
        !searchText ||
        item.name?.toLowerCase().includes(searchText) ||
        item.brand?.toLowerCase().includes(searchText) ||
        item.model?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText) ||
        item.location?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText);

      return (
        matchesStatus &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [equipment, search, statusFilter, categoryFilter]);

  // Approve or Reject Equipment
  const handleStatusUpdate = async (
    id: string,
    name: string,
    status: "Approved" | "Rejected"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status.toLowerCase()} "${name}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update equipment status."
        );
      }

      setEquipment((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, status } : item
        )
      );

      setSelectedEquipment((previous) =>
        previous?._id === id
          ? { ...previous, status }
          : previous
      );

      setMessage(
        data.message ||
          `Equipment ${status.toLowerCase()} successfully!`
      );

      await fetchStats();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete equipment."
        );
      }

      setEquipment((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setSelectedEquipment((previous) =>
        previous?._id === id ? null : previous
      );

      setMessage(
        data.message || "Equipment deleted successfully!"
      );

      await fetchStats();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: Equipment) => {
    setEditingEquipment(item);

    setEditForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "Construction Equipment",
      location: item.location || "",
      rentalPrice: String(item.rentalPrice ?? ""),
      rentalType: item.rentalType || "Daily",
      availableQuantity: String(item.availableQuantity ?? 1),
      condition: item.condition || "",
      brand: item.brand || "",
      model: item.model || "",
      image: item.image || "",
      rentalTerms: item.rentalTerms || "",
    });

    setSelectedEquipment(null);
    setError("");
    setMessage("");
  };

  // Handle Edit Form Input
  const handleEditChange = (
    field: keyof EquipmentFormData,
    value: string
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Admin: Update Equipment
  const handleEditSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingEquipment) return;

    const rentalPrice = Number(editForm.rentalPrice);
    const availableQuantity = Number(editForm.availableQuantity);

    if (!Number.isFinite(rentalPrice) || rentalPrice <= 0) {
      setError("Rental price must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(availableQuantity) ||
      availableQuantity < 1
    ) {
      setError("Available quantity must be a positive integer.");
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      category: editForm.category,
      location: editForm.location.trim(),
      rentalPrice,
      rentalType: editForm.rentalType,
      availableQuantity,
      condition: editForm.condition.trim(),
      brand: editForm.brand.trim(),
      model: editForm.model.trim(),
      image: editForm.image.trim(),
      rentalTerms: editForm.rentalTerms.trim(),
    };

    try {
      setSavingEdit(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/${editingEquipment._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const validationMessage = Array.isArray(data.errors)
          ? data.errors
              .map(
                (item: { field?: string; message?: string }) =>
                  `${item.field || "Field"}: ${
                    item.message || "Invalid value"
                  }`
              )
              .join(", ")
          : "";

        throw new Error(
          validationMessage ||
            data.message ||
            "Failed to update equipment."
        );
      }

      const updatedEquipment: Equipment = {
        ...editingEquipment,
        ...payload,
      };

      setEquipment((previous) =>
        previous.map((item) =>
          item._id === editingEquipment._id
            ? updatedEquipment
            : item
        )
      );

      setSelectedEquipment((previous) =>
        previous?._id === editingEquipment._id
          ? updatedEquipment
          : previous
      );

      setMessage(
        data.message || "Equipment updated successfully!"
      );

      setEditingEquipment(null);
      setEditForm(initialEditForm);

      await fetchStats();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // Status Styles
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

  const statusOptions: StatusFilter[] = [
    "All",
    "Pending",
    "Approved",
    "Rejected",
  ];

  const statCards = [
    {
      title: "Total Equipment",
      value: stats.totalEquipment,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Pending",
      value: stats.pendingEquipment,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: stats.approvedEquipment,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Rejected",
      value: stats.rejectedEquipment,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  // Date formatting
  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
              Manage Equipment
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review, approve, reject and manage all submitted equipment.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-4 ${stat.bg}`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Search and Filters */}
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

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="mt-5 flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status === "All" ? "All Status" : status}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>
              Showing <strong>{filteredEquipment.length}</strong> of{" "}
              <strong>{equipment.length}</strong> equipment
            </span>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setCategoryFilter("All");
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && equipment.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
          </div>
        ) : error && equipment.length === 0 ? (
          <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
            <AlertCircle className="mx-auto h-14 w-14 text-red-400" />

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Unable to Load Equipment
            </h3>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={refreshAll}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
            <Package className="mx-auto h-14 w-14 text-gray-300" />

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No Equipment Found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
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
                        ৳{Number(item.rentalPrice || 0).toLocaleString("en-BD")} / {item.rentalType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-t pt-4 text-xs text-gray-400">
                      <Clock className="h-4 w-4" />
                      Added on {formatDate(item.createdAt)}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 border-t pt-4">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        disabled={
                          savingEdit ||
                          deletingId !== null ||
                          updatingId !== null
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Equipment
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedEquipment(item)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>

                      {item.status === "Pending" && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(
                                item._id,
                                item.name,
                                "Approved"
                              )
                            }
                            disabled={
                              updatingId !== null ||
                              deletingId !== null
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {updatingId === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(
                                item._id,
                                item.name,
                                "Rejected"
                              )
                            }
                            disabled={
                              updatingId !== null ||
                              deletingId !== null
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item._id, item.name)
                        }
                        disabled={
                          deletingId !== null ||
                          updatingId !== null
                        }
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

        {/* Admin Edit Equipment Modal */}
        {editingEquipment && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
            onClick={() => {
              if (!savingEdit) {
                setEditingEquipment(null);
                setError("");
              }
            }}
          >
            <div
              className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Equipment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update equipment information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingEquipment(null);
                    setError("");
                  }}
                  disabled={savingEdit}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Close edit modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="p-5">
                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Equipment Name */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Equipment Name *
                    </label>

                    <input
                      type="text"
                      required
                      minLength={3}
                      value={editForm.name}
                      onChange={(event) =>
                        handleEditChange("name", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Description *
                    </label>

                    <textarea
                      required
                      minLength={10}
                      rows={4}
                      value={editForm.description}
                      onChange={(event) =>
                        handleEditChange("description", event.target.value)
                      }
                      className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Category *
                    </label>

                    <select
                      required
                      value={editForm.category}
                      onChange={(event) =>
                        handleEditChange("category", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      {equipmentCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Location *
                    </label>

                    <input
                      type="text"
                      required
                      minLength={2}
                      value={editForm.location}
                      onChange={(event) =>
                        handleEditChange("location", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Rental Price */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Rental Price (৳) *
                    </label>

                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={editForm.rentalPrice}
                      onChange={(event) =>
                        handleEditChange("rentalPrice", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Rental Type */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Rental Type *
                    </label>

                    <select
                      required
                      value={editForm.rentalType}
                      onChange={(event) =>
                        handleEditChange("rentalType", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Available Quantity */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Available Quantity *
                    </label>

                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={editForm.availableQuantity}
                      onChange={(event) =>
                        handleEditChange(
                          "availableQuantity",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Condition *
                    </label>

                    <input
                      type="text"
                      required
                      minLength={2}
                      value={editForm.condition}
                      onChange={(event) =>
                        handleEditChange("condition", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Brand *
                    </label>

                    <input
                      type="text"
                      required
                      minLength={2}
                      value={editForm.brand}
                      onChange={(event) =>
                        handleEditChange("brand", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Model *
                    </label>

                    <input
                      type="text"
                      required
                      minLength={1}
                      value={editForm.model}
                      onChange={(event) =>
                        handleEditChange("model", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Equipment Image URL *
                    </label>

                    <input
                      type="url"
                      required
                      value={editForm.image}
                      onChange={(event) =>
                        handleEditChange("image", event.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Rental Terms */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Rental Terms *
                    </label>

                    <textarea
                      required
                      minLength={5}
                      rows={3}
                      value={editForm.rentalTerms}
                      onChange={(event) =>
                        handleEditChange("rentalTerms", event.target.value)
                      }
                      placeholder="Enter rental terms and conditions..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="mt-7 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEquipment(null);
                      setError("");
                    }}
                    disabled={savingEdit}
                    className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Equipment Details Modal */}
        {selectedEquipment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
            onClick={() => setSelectedEquipment(null)}
          >
            <div
              className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Equipment Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    Complete equipment information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEquipment(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                {selectedEquipment.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedEquipment.image}
                    alt={selectedEquipment.name}
                    className="h-64 w-full rounded-xl bg-gray-100 object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedEquipment.name}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(selectedEquipment.status)}`}
                  >
                    {selectedEquipment.status}
                  </span>
                </div>

                <p className="text-sm leading-7 text-gray-600">
                  {selectedEquipment.description || "No description available."}
                </p>

                <div className="grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Brand</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedEquipment.brand || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedEquipment.model || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedEquipment.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedEquipment.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Rental Price</p>
                    <p className="mt-1 font-semibold text-indigo-600">
                      ৳{Number(selectedEquipment.rentalPrice || 0).toLocaleString("en-BD")} / {selectedEquipment.rentalType}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Available Quantity</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedEquipment.availableQuantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Condition</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedEquipment.condition}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Added On</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(selectedEquipment.createdAt)}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Rental Terms</p>
                    <p className="mt-1 whitespace-pre-wrap font-semibold text-gray-900">
                      {selectedEquipment.rentalTerms || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Edit from Details */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedEquipment)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Equipment
                </button>

                {selectedEquipment.status === "Pending" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedEquipment._id,
                          selectedEquipment.name,
                          "Approved"
                        )
                      }
                      disabled={updatingId !== null}
                      className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedEquipment._id,
                          selectedEquipment.name,
                          "Rejected"
                        )
                      }
                      disabled={updatingId !== null}
                      className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 border-t pt-4 text-sm text-gray-500">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  Admin equipment management
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
