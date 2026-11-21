
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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

/** Popular categories from the assignment. */
const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

const RENTAL_TYPES = ["Daily", "Weekly", "Monthly"];

/** 9 items per page keeps the 3-column grid perfectly filled. */
const PAGE_SIZE = 9;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Filters {
  search: string;
  category: string;
  location: string;
  rentalType: string;
  minPrice: string;
  maxPrice: string;
  availability: string;
  sort: string;
}

const emptyFilters: Filters = {
  search: "",
  category: "",
  location: "",
  rentalType: "",
  minPrice: "",
  maxPrice: "",
  availability: "",
  sort: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Challenge 1: server-side search / filters / sorting
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update any filter and jump back to page 1
  const updateFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== ""
  );

  // Fetch equipment from the server whenever filters/page change (debounced)
  useEffect(() => {
    const controller = new AbortController();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (filters.search.trim()) {
          params.set("search", filters.search.trim());
        }
        if (filters.category) {
          params.set("category", filters.category);
        }
        if (filters.location.trim()) {
          params.set("location", filters.location.trim());
        }
        if (filters.rentalType) {
          params.set("rentalType", filters.rentalType);
        }
        if (filters.minPrice) {
          params.set("minPrice", filters.minPrice);
        }
        if (filters.maxPrice) {
          params.set("maxPrice", filters.maxPrice);
        }
        if (filters.availability) {
          params.set("availability", filters.availability);
        }
        if (filters.sort) {
          params.set("sort", filters.sort);
        }

        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

        const response = await fetch(
          `${API_URL}/equipment/search/filter?${params.toString()}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load equipment."
          );
        }

        if (!Array.isArray(data.equipment)) {
          throw new Error("Invalid equipment data received from server.");
        }

        setEquipment(data.equipment);
        setTotal(data.total ?? data.equipment.length);
        setPages(
          data.pages ??
            Math.max(
              1,
              Math.ceil((data.total ?? 0) / PAGE_SIZE)
            )
        );
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
          setFetching(false);
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, page, retryCount]);

  // Favorites are optional — loaded once for the signed-in customer
  useEffect(() => {
    const controller = new AbortController();

    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();

          setFavoriteIds(
            (data.favorites || []).map((item: Equipment) => item._id)
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        // Continue browsing even if favorites cannot load.
      }
    };

    loadFavorites();

    return () => controller.abort();
  }, [retryCount]);

  // Retry fetching
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Add or remove favorite
  const handleFavorite = useCallback(
    async (equipmentId: string) => {
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
    },
    [favoriteIds, favoriteLoading]
  );

  // Loading UI (first load only)
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
  if (error && equipment.length === 0) {
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

  // Page numbers (first, last, current ± 1, ellipses)
  const pageNumbers: (number | "…")[] = [];

  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);

    if (start > 2) pageNumbers.push("…");
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (end < pages - 1) pageNumbers.push("…");

    pageNumbers.push(pages);
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

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

        {/* Search and Filters — all evaluated on the server */}
        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="text-indigo-600" size={21} />

            <h2 className="text-lg font-bold text-gray-900">
              Search & Filters
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Search by name / category / location */}
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
                  value={filters.search}
                  onChange={(e) =>
                    updateFilter("search", e.target.value)
                  }
                  placeholder="Name, category, location..."
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
                value={filters.category}
                onChange={(e) =>
                  updateFilter("category", e.target.value)
                }
                className={inputClass}
              >
                <option value="">All Categories</option>

                {CATEGORIES.map((category) => (
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

              <input
                type="text"
                value={filters.location}
                onChange={(e) =>
                  updateFilter("location", e.target.value)
                }
                placeholder="e.g. Dhaka"
                className={inputClass}
              />
            </div>

            {/* Rental Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rental Type
              </label>

              <select
                value={filters.rentalType}
                onChange={(e) =>
                  updateFilter("rentalType", e.target.value)
                }
                className={inputClass}
              >
                <option value="">All Rental Types</option>

                {RENTAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price Range (৳)
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    updateFilter("minPrice", e.target.value)
                  }
                  placeholder="Min"
                  className={inputClass}
                />

                <span className="text-gray-400">–</span>

                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    updateFilter("maxPrice", e.target.value)
                  }
                  placeholder="Max"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Availability
              </label>

              <select
                value={filters.availability}
                onChange={(e) =>
                  updateFilter("availability", e.target.value)
                }
                className={inputClass}
              >
                <option value="">All Equipment</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Sorting — handled by MongoDB on the server */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t pt-4">
            <div className="w-full sm:w-64">
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <ArrowUpDown size={15} className="text-indigo-600" />
                Sort By
              </label>

              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className={inputClass}
              >
                <option value="">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-indigo-600">
                  {from}–{to}
                </span>{" "}
                of {total} equipment
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
        </div>

        {/* Favorite / error message */}
        {(message || (error && equipment.length > 0)) && (
          <div
            role="status"
            className={`mb-6 rounded-lg p-3 text-center text-sm ${
              error
                ? "bg-red-50 text-red-600"
                : "bg-indigo-50 text-indigo-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* Updating indicator while refetching */}
        {fetching && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-indigo-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Updating results...
          </div>
        )}

        {/* Equipment Cards */}
        {equipment.length === 0 && !fetching ? (
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
          <div
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
              fetching ? "opacity-60" : "opacity-100"
            }`}
          >
            {equipment.map((item) => {
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

                    {/* Category + Availability */}
                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow">
                      {item.category}
                    </span>

                    <span
                      className={`absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow ${
                        item.availableQuantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.availableQuantity > 0
                        ? "Available"
                        : "Out of Stock"}
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

        {/* Pagination — optional requirement */}
        {pages > 1 && (
          <nav
            aria-label="Equipment pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || fetching}
              aria-label="Previous page"
              className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            {pageNumbers.map((number, index) =>
              number === "…" ? (
                <span
                  key={`gap-${index}`}
                  className="px-2 text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  disabled={fetching}
                  aria-current={page === number ? "page" : undefined}
                  className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                    page === number
                      ? "bg-indigo-600 text-white"
                      : "border bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages || fetching}
              aria-label="Next page"
              className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
