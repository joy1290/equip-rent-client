
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowLeft } from "lucide-react";

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
  favoritedAt: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/favorites`;

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load favorites");
      }

      setFavorites(data.favorites || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (equipmentId: string) => {
    try {
      setRemovingId(equipmentId);
      setError("");

      const response = await fetch(`${API_URL}/${equipmentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Loading favorites...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
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

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="rounded-xl border bg-white px-6 py-16 text-center shadow-sm">
            <Heart className="mx-auto mb-4 text-gray-300" size={52} />

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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="h-52 overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      {item.category}
                    </span>

                    <h2 className="mt-3 text-xl font-bold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {item.brand} {item.model}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Location: {item.location}
                    </p>

                    <p className="mt-3 text-lg font-bold text-indigo-600">
                      ৳{item.rentalPrice}
                      <span className="text-sm font-normal text-gray-500">
                        /{item.rentalType}
                      </span>
                    </p>

                    <div className="mt-5 flex gap-3">
                      <Link
                        href={`/equipment/${item._id}`}
                        className="flex-1 rounded-lg bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(item._id)}
                        disabled={removingId === item._id}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                        {removingId === item._id ? "Removing..." : "Remove"}
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
