
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowLeft, RefreshCw } from "lucide-react";

interface FavoriteEquipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  brand: string;
  model: string;
  image: string;
  availableQuantity: number;
  favoritedAt: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/favorites`;

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
          signal,
        });

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
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
          err instanceof Error ? err.message : "Something went wrong"
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
    try {
      setRemovingId(equipmentId);
      setError("");

      const response = await fetch(`${API_URL}/${equipmentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove favorite");
      }

      setFavorites((prev) =>
        prev.filter((item) => item._id !== equipmentId)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading favorites...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <Heart className="fill-red-500 text-red-500" size={30} />
              My Favorites
            </h1>

            <p className="mt-2 text-gray-600">
              Your saved equipment in one place.
            </p>
          </div>

          <Link
            href="/dashboard/customer"
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="break-words text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetry((prev) => prev + 1)}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="rounded-xl border bg-white px-6 py-16 text-center shadow-sm">
            <Heart
              className="mx-auto mb-4 text-gray-300"
              size={52}
            />

            <h2 className="text-xl font-semibold text-gray-800">
              No Favorites Yet
            </h2>

            <p className="mt-2 text-gray-500">
              You have not added any equipment to your favorites.
            </p>

            <Link
              href="/equipment"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Explore Equipment
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-medium text-gray-600">
              {favorites.length} Favorite Equipment
            </p>

            {/* Favorites Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Equipment</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Rental Price</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Availability</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {favorites.map((item) => (
                    <tr
                      key={item._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Equipment */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                              <Heart size={18} className="text-gray-400" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {item.name}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {item.brand} {item.model}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-gray-600">
                        {item.category}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ৳{Number(item.rentalPrice || 0).toLocaleString("en-BD")}
                        <span className="text-xs font-normal text-gray-500">
                          /{item.rentalType}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-gray-600">
                        {item.location}
                      </td>

                      {/* Availability */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.availableQuantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.availableQuantity > 0
                            ? "Available"
                            : "Out of Stock"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/equipment/${item._id}`}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            View Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleRemove(item._id)}
                            disabled={removingId === item._id}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} />

                            {removingId === item._id
                              ? "Removing..."
                              : "Remove Favorite"}
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
