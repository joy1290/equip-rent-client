"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardHat,
  Camera,
  Car,
  Tractor,
  Cpu,
  PartyPopper,
  ShieldCheck,
  Package,
  CalendarDays,
  CreditCard,
  Search,
  Grid,
  Layout,
  Sun,
  Moon,
  Loader2,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

interface Equipment {
  id: string;
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

export default function AllEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    rentalType: "",
    minPrice: "",
    maxPrice: "",
    availability: "",
  });

  const [sort, setSort] = useState({
    by: "priceLow",
    order: "asc",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters and sort from URL search params
  useEffect(() => {
    const params = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      rentalType: searchParams.get("rentalType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      availability: searchParams.get("availability") || "",
    };
    setFilters(params);

    const sortBy = searchParams.get("sortBy") || "priceLow";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    setSort({ by: sortBy, order: sortOrder });
  }, [searchParams]);

  // Fetch equipment from API with filters and sort
  const fetchEquipment = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        search: filters.search,
        category: filters.category,
        rentalType: filters.rentalType,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        availability: filters.availability,
        sortBy: sort.by,
        sortOrder: sort.order,
      });

      const response = await fetch(`${API_URL}?${params}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load equipment.");
      }

      setEquipment(result.equipment);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof typeof filters;
    setFilters({ ...filters, [name]: e.target.value });
    // Update URL search params
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.rentalType) params.set("rentalType", filters.rentalType);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.availability) params.set("availability", filters.availability);
    if (sort.by) params.set("sortBy", sort.by);
    if (sort.order) params.set("sortOrder", sort.order);
    router.replace(`/equipment?${params.toString()}`);
  };

  // Handle sort changes
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const by = e.target.value;
    setSort({ by, order: sort.order === "asc" ? "desc" : "asc" });
    const params = new URLSearchParams();
    params.set("sortBy", by);
    params.set("sortOrder", sort.order === "asc" ? "desc" : "asc");
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.rentalType) params.set("rentalType", filters.rentalType);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.availability) params.set("availability", filters.availability);
    router.replace(`/equipment?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="mr-2 animate-spin text-blue-600" />
        <span className="text-gray-600">Loading equipment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center sm:p-10">
        <AlertCircle size={38} className="mx-auto text-red-500" />
        <h3 className="mt-4 text-lg font-bold text-gray-900">Unable to Load Equipment</h3>
        <p className="mt-2 break-words text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <RefreshCw size={17} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            All Equipment
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Browse and search our available equipment inventory
          </p>
        </div>

        {/* Search and Filters Section */}
        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            {/* Search */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search by name or location
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Equipment name, location..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                aria-label="Search equipment"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                aria-label="Filter by category"
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

            {/* Rental Type Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Rental Type
              </label>
              <select
                name="rentalType"
                value={filters.rentalType}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                aria-label="Filter by rental type"
              >
                <option value="">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Price Range (৳)
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-30 rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-48"
                aria-label="Minimum price"
              />
              <span className="mx-2 text-sm text-gray-500">to</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-30 rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-48"
                aria-label="Maximum price"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Availability
              </label>
              <select
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                aria-label="Filter by availability"
              >
                <option value="">All Availability</option>
                <option value="in-stock">In Stock</option>
              </select>
            </div>

            {/* Sort */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Sort By
              </label>
              <select
                name="sort"
                value={sort.by}
                onChange={handleSortChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                aria-label="Sort by"
              >
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="recentlyAdded">Recently Added</option>
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (filters.search) params.set("search", filters.search);
                  if (filters.category) params.set("category", filters.category);
                  if (filters.rentalType) params.set("rentalType", filters.rentalType);
                  if (filters.minPrice) params.set("minPrice", filters.minPrice);
                  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
                  if (filters.availability) params.set("availability", filters.availability);
                  if (sort.by) params.set("sortBy", sort.by);
                  if (sort.order) params.set("sortOrder", sort.order);
                  router.replace(`/equipment?${params.toString()}`);
                }}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </section>

        {/* Equipment Grid */}
        <section className="bg-white rounded-2xl overflow-shadow p-6 sm:p-8 lg:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="mt-4 text-sm font-medium text-gray-600">Loading equipment...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-white p-6 text-center sm:p-10">
              <AlertCircle size={38} className="mx-auto text-red-500" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">Unable to Load Equipment</h3>
              <p className="mt-2 break-words text-sm text-gray-600">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <RefreshCw size={17} /> Try Again
              </button>
            </div>
          ) : equipment.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              <Package size={48} className="mx-auto text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-800">No Equipment Available</h3>
              <p className="mt-2 text-sm text-gray-500">
                No approved equipment matches your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {equipment.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border bg-white shadow-sm overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Equipment Image */}
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
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
                    <span className="absolute left-3 top-3 max-w-[80%] truncate rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow sm:left-4 sm:top-4">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                      {item.name}
                    </h3>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {item.brand} {item.model}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} className="shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-end justify-between">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Rental Price</p>
                        <p className="text-lg font-bold text-indigo-600 sm:text-xl">
                          ৳{Number(item.rentalPrice).toLocaleString("en-BD")}
                          <span className="text-xs font-normal text-gray-500">/{item.rentalType}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/equipment/${item.id}`)}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:px-4 sm:text-sm"
                        aria-details="View details for {item.name}"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {equipment.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/equipment"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-600 px-6 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white sm:w-auto"
              >
                ← Back to All Equipment
                <ArrowLeft size={18} />
              </Link>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}