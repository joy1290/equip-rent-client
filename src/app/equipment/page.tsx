"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Loader2, RefreshCw, AlertCircle, MapPin, Search, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Equipment {
  _id: string;
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
  success: boolean;
  total: number;
  equipment: Equipment[];
  message?: string;
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

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      const response = await fetch(`${API_URL}/equipment/search/filter?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to load equipment.");
      setEquipment(Array.isArray(result.equipment) ? result.equipment : []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  }, [filters, sort, page]);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);
  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters((prev) => ({ ...prev, [name]: value })); };
  const handleApplyFilters = () => { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); }); params.set("sort", sort); params.set("page", "1"); router.replace(`/equipment?${params.toString()}`); };
  const handleReset = () => { setFilters({ search: "", category: "", location: "", rentalType: "", minPrice: "", maxPrice: "", availability: "" }); setSort("price-asc"); setPage(1); router.replace("/equipment"); };

  const lastPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  // Build equipment items outside of JSX return to simplify
  const equipmentItems = equipment.map((item) => {
    const id = item._id || item.id;
    return (
      <div key={id} className="border rounded p-4 mb-3">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.category}</p>
        <p className="text-xs text-gray-500">৳{item.rentalPrice}</p>
      </div>
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">All Equipment</h1>
          <p className="text-sm text-gray-600">Browse our inventory</p>
        </div>

        <div className="mb-6">
          <button onClick={handleApplyFilters} className="bg-indigo-600 text-white px-3 py-2 rounded">Apply Filters</button>
          <button onClick={handleReset} className="bg-gray-200 px-3 py-2 rounded ml-2">Reset</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {equipmentItems}
        </div>

        {total > ITEMS_PER_PAGE && (
          <div className="mt-4">
            Page {page} of {lastPage}
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="mr-1">Prev</button>
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((num) => (
              <button key={num} className={`mr-1 ${page === num ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>{num}</button>
            ))
            <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="ml-1">Next</button>
          </div>
        )}

        <div className="mt-4">
          <Link href="/" className="underline">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}