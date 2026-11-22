
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Heart,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Package,
  MapPin,
  Eye,
} from "lucide-react";

interface FavoriteEquipment {
  _id: string;
  name: string;
  description?: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  brand: string;
  model: string;
  image: string;
  availableQuantity: number;
  favoritedAt?: string;
}

interface FavoritesResponse {
  success?: boolean;
  message?: string;
  favorites?: FavoriteEquipment[];
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/favorites`;

const formatAmount = (amount?: number) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-BD");
};

export default function MyFavoritesPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const fetchFavorites = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
        });

        const data = (await response.json()) as FavoritesResponse;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Failed to load favorites");
        }

        if (!Array.isArray(data.favorites)) {
          throw new Error("Invalid favorites data received");
        }

        setFavorites(data.favorites);
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
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [router]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchFavorites(controller.signal);

    return () => controller.abort();
  }, [fetchFavorites, retry]);

  const handleRemove = async (equipmentId: string) => {
    if (removingId) return;

    try {
      setRemovingId(equipmentId);
      setError("");

      const response = await fetch(`${API_URL}/${equipmentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to remove favorite"
        );
      }

      setFavorites((previous) =>
        previous.filter((item) => item._id !== equipmentId)
      );

      toast.success("Removed from favorites");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong";

      setError(message);
      toast.error(message);
    } finally {
      setRemovingId(null);
    }
  };

  // Loading State
  if (loading) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/dashboard/customer"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <Loader2
              size={40}
              className="animate-spin text-indigo-600"
            />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading favorites...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error State
  if (error && favorites.length === 0) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/dashboard/customer"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="mx-auto mt-8 w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <Heart
              size={42}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Unable to Load Favorites
            </h2>

            <p className="mt-2 break-words text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetry((previous) => previous + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">

        {/* Back to Dashboard */}
        <Link
          href="/dashboard/customer"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              <Heart
                className="fill-red-500 text-red-500"
                size={30}
              />
              My Favorites
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Your saved equipment in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRetry((previous) => previous + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && favorites.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Favorite Count */}
        {favorites.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-red-50 p-3">
              <Heart
                size={22}
                className="fill-red-500 text-red-500"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Saved Equipment
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {favorites.length}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <Heart
              className="mx-auto mb-4 text-gray-300"
              size={52}
            />

            <h2 className="text-xl font-semibold text-gray-800">
              No Favorites Yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You have not added any equipment to your favorites.
            </p>

            <Link
              href="/equipment"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              <Package size={18} />
              Explore Equipment
            </Link>
          </div>
        ) : (
          <>
            {/* Favorites Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-[950px] divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-4">Equipment</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Rental Price</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Availability</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {favorites.map((item) => (
                    <tr
                      key={item._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Equipment */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Equipment"}
                              loading="lazy"
                              className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <Package
                                size={20}
                                className="text-gray-400"
                              />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate font-semibold text-gray-900">
                              {item.name || "Equipment"}
                            </p>

                            <p className="max-w-[180px] truncate text-xs text-gray-500">
                              {[item.brand, item.model]
                                .filter(Boolean)
                                .join(" ") || "No brand information"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 text-gray-600">
                        {item.category || "—"}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        ৳{formatAmount(item.rentalPrice)}
                        <span className="text-xs font-normal text-gray-500">
                          /{item.rentalType || "day"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4 text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <MapPin
                            size={14}
                            className="shrink-0 text-gray-400"
                          />
                          {item.location || "—"}
                        </span>
                      </td>

                      {/* Availability */}
                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.availableQuantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.availableQuantity > 0
                            ? `${item.availableQuantity} Available`
                            : "Out of Stock"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/equipment/${item._id}`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Eye size={14} />
                            View Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleRemove(item._id)}
                            disabled={removingId !== null}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {removingId === item._id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}

                            {removingId === item._id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
