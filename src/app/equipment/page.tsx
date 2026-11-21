
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Package,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const ITEMS_PER_PAGE = 20;

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
  brand: string;
  model: string;
  image: string;
  rentalTerms: string;
}

interface EquipmentResponse {
  equipment?: Equipment[];
  total?: number;
  message?: string;
}

const initialFilters = {
  search: "",
  category: "",
  location: "",
  rentalType: "",
  minPrice: "",
  maxPrice: "",
  availability: "",
};

export default function AllEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("price-asc");
  const [page, setPage] = useState(1);

  // Sync filters with URL
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

    const urlPage = Number(searchParams.get("page") || 1);

    setPage(
      Number.isInteger(urlPage) && urlPage >= 1
        ? urlPage
        : 1
    );
  }, [searchParams]);

  // Fetch equipment
  const fetchEquipment = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.set(key, value.trim());
        }
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
          signal,
        }
      );

      const result: EquipmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load equipment."
        );
      }

      setEquipment(
        Array.isArray(result.equipment)
          ? result.equipment
          : []
      );

      setTotal(
        typeof result.total === "number"
          ? result.total
          : 0
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      setEquipment([]);
      setTotal(0);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [filters, sort, page]);

  useEffect(() => {
    const controller = new AbortController();

    fetchEquipment(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchEquipment]);

  // Update filter values
  const handleFilterChange = (
    name: keyof typeof initialFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    params.set("sort", sort);
    params.set("page", "1");

    setPage(1);
    router.replace(`/equipment?${params.toString()}`);
  };

  // Reset filters
  const handleReset = () => {
    setFilters(initialFilters);
    setSort("price-asc");
    setPage(1);

    router.replace("/equipment");
  };

  const lastPage = Math.max(
    1,
    Math.ceil(total / ITEMS_PER_PAGE)
  );

  // Pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage) {
      return;
    }

    setPage(newPage);

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(newPage));

    router.replace(`/equipment?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD").format(
      Number(price) || 0
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-4 py-16 sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100">
              <Package size={16} />
              EquipRent Equipment Marketplace
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Find the Right Equipment
              <span className="block text-indigo-300">
                For Your Next Project
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-indigo-100/80 sm:text-base">
              Explore quality equipment, compare rental prices,
              and find the right tools for your project.
              Renting equipment has never been easier.
            </p>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-indigo-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-400" />
                Quality Equipment
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-400" />
                Easy Booking
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-400" />
                Flexible Rentals
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Explore Our Collection
            </p>

            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              All Equipment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Discover equipment that matches your needs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">
              Total Equipment
            </p>

            <p className="text-xl font-bold text-indigo-600">
              {loading ? "..." : total}
            </p>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <SlidersHorizontal size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Find Your Equipment
                </h3>

                <p className="text-xs text-slate-500">
                  Filter equipment based on your requirements.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-600"
            >
              <RotateCcw size={15} />
              Reset Filters
            </button>
          </div>

          {/* Search */}
          <div className="mb-5">
            <label
              htmlFor="equipment-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search Equipment
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
              <Search size={19} className="shrink-0 text-slate-400" />

              <input
                id="equipment-search"
                type="text"
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange("search", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                placeholder="Search by equipment name, brand or model..."
                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Filter Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="equipment-category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <input
                id="equipment-category"
                type="text"
                value={filters.category}
                onChange={(e) =>
                  handleFilterChange("category", e.target.value)
                }
                placeholder="e.g. Photography Equipment"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="equipment-location"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Location
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <MapPin size={17} className="text-slate-400" />

                <input
                  id="equipment-location"
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  placeholder="Enter location"
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="equipment-rental-type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Rental Type
              </label>

              <input
                id="equipment-rental-type"
                type="text"
                value={filters.rentalType}
                onChange={(e) =>
                  handleFilterChange("rentalType", e.target.value)
                }
                placeholder="e.g. daily, weekly, monthly"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="minimum-price"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Minimum Price (৳)
              </label>

              <input
                id="minimum-price"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) =>
                  handleFilterChange("minPrice", e.target.value)
                }
                placeholder="Minimum price"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="maximum-price"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Maximum Price (৳)
              </label>

              <input
                id="maximum-price"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) =>
                  handleFilterChange("maxPrice", e.target.value)
                }
                placeholder="Maximum price"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="equipment-availability"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Availability
              </label>

              <select
                id="equipment-availability"
                value={filters.availability}
                onChange={(e) =>
                  handleFilterChange("availability", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All Equipment</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Find equipment that suits your project.
            </p>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Search size={17} />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Toolbar */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-slate-900">
              Available Equipment
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Finding equipment..."
                : `Showing ${equipment.length} of ${total} equipment`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={17} className="text-slate-400" />

            <label
              htmlFor="equipment-sort"
              className="text-sm text-slate-600"
            >
              Sort by:
            </label>

            <select
              id="equipment-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-indigo-600"
            />

            <p className="mt-4 font-semibold text-slate-700">
              Loading Equipment
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we find the best equipment for you.
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-2xl border border-red-100 bg-white px-5 py-16 text-center">
            <AlertCircle
              size={42}
              className="mx-auto text-red-500"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Unable to Load Equipment
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchEquipment()}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : equipment.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Package size={32} className="text-slate-400" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No Equipment Found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find any equipment matching your search.
              Try changing your filters or explore all equipment.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* Equipment Cards */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {equipment.map((item) => {
              const id = item._id || item.id;
              const available = item.availableQuantity > 0;

              return (
                <article
                  key={id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  {/* Equipment Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          size={55}
                          className="text-slate-300"
                        />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
                      {item.category}
                    </span>

                    <span
                      className={`absolute right-3 top-3 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-sm ${
                        available
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {available ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}

                      {available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  {/* Equipment Information */}
                  <div className="p-5">
                    <div className="mb-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        {item.brand} {item.model}
                      </p>

                      <h3 className="mt-1 line-clamp-1 text-lg font-bold text-slate-900 transition group-hover:text-indigo-700">
                        {item.name}
                      </h3>
                    </div>

                    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {item.description ||
                        "Quality equipment available for rental."}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin
                        size={15}
                        className="shrink-0 text-indigo-500"
                      />

                      <span className="truncate">
                        {item.location || "Location not specified"}
                      </span>
                    </div>

                    <div className="my-4 border-t border-slate-100" />

                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-400">
                          Rental Price
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-indigo-700">
                          ৳{formatPrice(item.rentalPrice)}
                        </p>

                        <p className="text-xs text-slate-500">
                          / {item.rentalType || "rental"}
                        </p>
                      </div>

                      <span className="text-right text-xs text-slate-400">
                        {item.availableQuantity > 0
                          ? `${item.availableQuantity} available`
                          : "Currently unavailable"}
                      </span>
                    </div>

                    {id && (
                      <Link
                        href={`/equipment/${id}`}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
                      >
                        <Eye size={17} />
                        View Details
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          !error &&
          equipment.length > 0 &&
          total > ITEMS_PER_PAGE && (
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-bold text-slate-900">
                  {page}
                </span>
                {" "}of{" "}
                <span className="font-bold text-slate-900">
                  {lastPage}
                </span>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Previous */}
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from(
                  { length: lastPage },
                  (_, index) => index + 1
                ).map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => handlePageChange(num)}
                    disabled={page === num}
                    aria-current={page === num ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                      page === num
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {/* Next */}
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= lastPage}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}
