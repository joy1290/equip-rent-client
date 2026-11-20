
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  rentalTerms: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

// Equipment Details Content
function EquipmentDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Equipment not found");
        }

        setEquipment(data.equipment);
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEquipment();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <p className="text-lg font-medium text-gray-600">
          Loading equipment details...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !equipment) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-500">
          {error || "Equipment not found"}
        </p>

        <button
          onClick={() => router.push("/equipment")}
          className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          Back to Equipment
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 font-medium text-indigo-600 hover:underline"
        >
          ← Back
        </button>

        {/* Equipment Details */}
        <div className="grid overflow-hidden rounded-2xl bg-white shadow-md md:grid-cols-2">

          {/* Equipment Image */}
          <div className="min-h-72 bg-gray-100 md:min-h-full">
            <img
              src={equipment.image}
              alt={equipment.name}
              className="h-72 w-full object-cover sm:h-96 md:h-full"
            />
          </div>

          {/* Equipment Information */}
          <div className="p-5 sm:p-8 lg:p-10">

            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
              {equipment.category}
            </span>

            <h1 className="mt-4 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
              {equipment.name}
            </h1>

            <p className="mt-3 leading-relaxed text-gray-600">
              {equipment.description}
            </p>

            {/* Equipment Specifications */}
            <div className="mt-6 space-y-3 text-sm text-gray-700 sm:text-base">
              <p>
                <strong>Brand:</strong> {equipment.brand}
              </p>

              <p>
                <strong>Model:</strong> {equipment.model}
              </p>

              <p>
                <strong>Condition:</strong> {equipment.condition}
              </p>

              <p>
                <strong>Location:</strong> {equipment.location}
              </p>

              <p>
                <strong>Available Quantity:</strong>{" "}
                {equipment.availableQuantity}
              </p>
            </div>

            {/* Rental Information */}
            <div className="mt-7 border-t pt-6">

              <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                ৳{equipment.rentalPrice}

                <span className="text-base font-normal text-gray-500">
                  /{equipment.rentalType}
                </span>
              </p>

              {/* Rental Terms */}
              <div className="mt-5">
                <h2 className="font-semibold text-gray-900">
                  Rental Terms
                </h2>

                <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-600">
                  {equipment.rentalTerms}
                </p>
              </div>

              {/* Booking Button */}
              <button
                disabled={equipment.availableQuantity <= 0}
                onClick={() =>
                  router.push(`/booking/${equipment._id}`)
                }
                className="mt-7 w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {equipment.availableQuantity > 0
                  ? "Book Now"
                  : "Not Available"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main Page with Suspense
export default function EquipmentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <p className="text-lg font-medium text-gray-600">
            Loading equipment details...
          </p>
        </div>
      }
    >
      <EquipmentDetailsContent />
    </Suspense>
  );
}
