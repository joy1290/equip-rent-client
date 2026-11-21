"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Loader2,
  RefreshCw,
  AlertCircle,
  MapPin,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Equipment {
  _id: string;
  id?: string;
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
  rentalTerms: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface EquipmentResponse {
  success: boolean;
  total: number;
  equipment: Equipment[];
  message?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export default function AllEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    rentalType: "",
    minPrice: "",
    maxPrice: "",
    availability: "",
  });

  const [sort, setSort] = useState("price-asc");

  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  // Initialize filters from URL
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || "",
      rentalType: searchParams.get("rentalType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      availability: searchParams.get("availability") || "",
    });

    setSort(searchParams.get("sort") || "price-asc");

    const pageFromUrl = searchParams.get("page");
    if (pageFromUrl && Number.isInteger(Number(pageFromUrl)) && Number(pageFromUrl) >= 1) {
      setPage(Number(pageFromUrl));
    }
  }, [searchParams]);

  // Fetch equipment
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));

      const response = await fetch(
        `${API_URL}/equipment/search/filter?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result: EquipmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load equipment."
        );
      }

      setEquipment(
        Array.isArray(result.equipment) ? result.equipment : []
      );

      setTotal(result.total || 0);
    } catch (err) {
      console.error("Equipment fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [filters, sort, page]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Update filter
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters to URL with pagination
  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    params.set("sort", sort);
    params.set("page", "1");

    router.replace(`/equipment?${params.toString()}`);
  };

  // Reset filters
  const handleReset = () => {
    setFilters({
      search: "",
      category: "",
      location: "",
      rentalType: "",
      minPrice: "",
      maxPrice: "",
      availability: "",
    });

    setSort("price-asc");
    setPage(1);
    router.replace("/equipment");
  };

  const lastPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            All Equipment
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Browse and search our available equipment inventory.
          </p>
        </div>

        {/* Filters */}
        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Equipment name..."
                  className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none focus-border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="Construction Equipment">Construction Equipment</option>
                <option value="Photography Equipment">Photography Equipment</option>
                <option value="Vehicles & Transportation">Vehicles & Transportation</option>
                <option value="Agriculture Equipment">Agriculture Equipment</option>
                <option value="Electronics">Electronics</option>
                <option value="Event Equipment">Event Equipment</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rental Type
              </label>

              <select
                name="rentalType"
                value={filters.rentalType}
                onChange={handleFilterChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>

              <input
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Enter location"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Price (৳)
              </label>

              <input
                type="number"
                min="0"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Minimum price"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Maximum Price (৳)
              </label>

              <input
                type="number"
                min="0"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Maximum price"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Availability
              </label>

              <select
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              >
                <option value="">All Availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort By
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus-border-indigo-500"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="recentlyAdded">Recently Added</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleApplyFilters}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Apply Filters
            </button>

            <button
              onClick={handleReset}
              className="rounded-lg border px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </section>

        {/* Equipment */}
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Available Equipment
            </h2>

            <span className="text-sm text-gray-500">
              {total} results
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm text-gray-600">
                Loading equipment...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Unable to Load Equipment
              </h3>

              <p className="mt-2 break-words text-sm text-gray-600">
                {error}
              </p>

              <button
                onClick={fetchEquipment}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          ) : equipment.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-14 w-14 text-gray-300" />

              <h3 className="mt-4 font-semibold text-gray-800">
                No Equipment Available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                No approved equipment matches your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {equipment.map((item) => {
                const itemId = item._id || item.id;

                return (
                  <article
                    key={itemId}
                    className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-14 w-14 text-gray-400" />
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="truncate text-lg font-bold text-gray-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {item.brand} {item.model}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} />
                        <span className="truncate">
                          {item.location}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            Rental Price
                          </p>

                          <p className="text-lg font-bold text-indigo-600">
                            ৳{Number(item.rentalPrice).toLocaleString("en-BD")}
                          </p>

                          <span className="text-xs text-gray-500">
                            /{item.rentalType}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            router.push(`/equipment/${itemId}`)
                          }
                          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          View Details
                        </button>
                      </div>

                      <p className="mt-3 text-xs text-gray-500">
                        Available quantity: {item.availableQuantity}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {total > ITEMS_PER_PAGE && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-semibold text-gray-700">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {lastPage}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {Array.from(
                  { length: lastPage },
                  (_, index) => index + 1
                ).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    aria-current={page === num ? "page" : undefined}
                    className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      page === num
                        ? "bg-indigo-600 text-white"
                        : "border bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(lastPage, p + 1))
                  }
                  disabled={page === lastPage}
                  className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
  );
}