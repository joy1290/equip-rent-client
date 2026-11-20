
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  MapPin,
  RefreshCw,
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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");

  // Fetch equipment and favorites
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const equipmentResponse = await fetch(`${API_URL}/equipment`, {
          signal: controller.signal,
        });

        const equipmentData = await equipmentResponse.json();

        if (!equipmentResponse.ok) {
          throw new Error(
            equipmentData.message || "Failed to load equipment."
          );
        }

        if (!Array.isArray(equipmentData.equipment)) {
          throw new Error("Invalid equipment data received from server.");
        }

        setEquipment(equipmentData.equipment);

        // Favorites are optional
        try {
          const favoriteResponse = await fetch(`${API_URL}/favorites`, {
            credentials: "include",
            signal: controller.signal,
          });

          if (favoriteResponse.ok) {
            const favoriteData = await favoriteResponse.json();

            setFavoriteIds(
              (favoriteData.favorites || []).map(
                (item: Equipment) => item._id
              )
            );
          }
        } catch (favoriteError) {
          if (
            favoriteError instanceof Error &&
            favoriteError.name === "AbortError"
          ) {
            return;
          }

          // Continue browsing even if favorites cannot load.
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load equipment. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  // Dynamic categories
  const categories = useMemo(
    () =>
      [...new Set(equipment.map((item) => item.category).filter(Boolean))],
    [equipment]
  );

  // Dynamic locations
  const locations = useMemo(
    () =>
      [...new Set(equipment.map((item) => item.location).filter(Boolean))],
    [equipment]
  );

  // Search, filter and sorting
  const filteredEquipment = useMemo(() => {
    let result = [...equipment];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((item) =>
        [
          item.name,
          item.brand,
          item.model,
          item.category,
          item.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          )
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (item) => item.category === selectedCategory
      );
    }

    if (selectedLocation !== "All") {
      result = result.filter(
        (item) => item.location === selectedLocation
      );
    }

    if (sortOrder === "low-high") {
      result.sort(
        (a, b) => Number(a.rentalPrice) - Number(b.rentalPrice)
      );
    } else if (sortOrder === "high-low") {
      result.sort(
        (a, b) => Number(b.rentalPrice) - Number(a.rentalPrice)
      );
    }

    return result;
  }, [
    equipment,
    searchTerm,
    selectedCategory,
    selectedLocation,
    sortOrder,
  ]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSortOrder("default");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedLocation !== "All" ||
    sortOrder !== "default";

  // Retry fetching
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Add or remove favorite
  const handleFavorite = async (equipmentId: string) => {
    if (favoriteLoading) return;

    setFavoriteLoading(equipmentId);
    setMessage("");

    const isFavorite = favoriteIds.includes(equipmentId);

    try {
      const response = await fetch(
        `${API_URL}/favorites/${equipmentId}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update favorites."
        );
      }

      if (isFavorite) {
        setFavoriteIds((prev) =>
          prev.filter((id) => id !== equipmentId)
        );

        setMessage("Removed from favorites.");
      } else {
        setFavoriteIds((prev) =>
          prev.includes(equipmentId)
            ? prev
            : [...prev, equipmentId]
        );

        setMessage("Added to favorites successfully.");
      }
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setFavoriteLoading(null);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

        <p className="mt-5 text-lg font-semibold text-gray-700">
          Loading Equipment...
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we fetch available equipment.
        </p>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Something Went Wrong!
          </h2>

          <p className="mt-3 text-sm text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Explore Equipment
          </h1>

          <p className="mt-3 text-gray-600">
            Find the right equipment for your next project.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="text-indigo-600" size={21} />

            <h2 className="text-lg font-bold text-gray-900">
              Search & Filters
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Equipment
              </label>

              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, brand..."
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="All">All Locations</option>

                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort By Price
              </label>

              <div className="relative">
                <ArrowUpDown
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="default">Default Sorting</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Bottom */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-indigo-600">
                {filteredEquipment.length}
              </span>{" "}
              of {equipment.length} equipment
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <X size={17} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Favorite Message */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-lg bg-indigo-50 p-3 text-center text-sm text-indigo-700"
          >
            {message}
          </div>
        )}

        {/* Equipment Cards */}
        {filteredEquipment.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <Search size={42} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Equipment Found
            </h2>

            <p className="mt-2 text-gray-500">
              Try changing your search or filter options.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEquipment.map((item) => {
              const isFavorite = favoriteIds.includes(item._id);

              return (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No Image Available
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={() => handleFavorite(item._id)}
                      disabled={favoriteLoading === item._id}
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Heart
                        size={21}
                        className={
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }
                      />
                    </button>

                    {/* Category */}
                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow">
                      {item.category}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {item.brand} {item.model}
                    </p>

                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-indigo-500" />
                      {item.location}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Rental Price
                        </p>

                        <p className="text-xl font-bold text-indigo-600">
                          ৳{Number(item.rentalPrice).toLocaleString("en-BD")}
                          <span className="text-sm font-normal text-gray-500">
                            /{item.rentalType}
                          </span>
                        </p>
                      </div>

                      <span className="text-xs text-gray-500">
                        Available: {item.availableQuantity}
                      </span>
                    </div>

                    {/* Details Button */}
                    <Link
                      href={`/equipment/${item._id}`}
                      className="mt-5 block rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
