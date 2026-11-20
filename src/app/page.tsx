
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Wrench,
  Search,
  CalendarCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/equipment`;

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

const reviews = [
  {
    name: "Rahim Ahmed",
    role: "Customer",
    review:
      "The booking process is simple and convenient. I could easily find the equipment I needed.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "Customer",
    review:
      "A useful platform for renting equipment without having to purchase everything.",
    rating: 5,
  },
  {
    name: "Tanvir Hasan",
    role: "Customer",
    review:
      "The equipment details and rental information make choosing much easier.",
    rating: 5,
  },
  {
    name: "Sadia Islam",
    role: "Customer",
    review:
      "I like how easy it is to browse equipment and manage my bookings.",
    rating: 5,
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted Equipment",
    description:
      "Browse equipment reviewed and approved before appearing on the platform.",
  },
  {
    icon: Package,
    title: "Flexible Rental",
    description:
      "Explore rental options and choose equipment that fits your needs.",
  },
  {
    icon: Clock,
    title: "Easy Booking",
    description:
      "Book equipment online and manage your rental bookings from one place.",
  },
  {
    icon: Users,
    title: "Customer Friendly",
    description:
      "A simple experience for customers and equipment owners.",
  },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find Equipment",
    description: "Browse available equipment and choose what you need.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Equipment",
    description: "Select your rental dates and submit your booking.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Confirm & Pay",
    description: "After approval, complete your payment securely.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 sm:text-sm">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Fetch featured equipment
  useEffect(() => {
    const controller = new AbortController();

    const fetchEquipment = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load equipment."
          );
        }

        if (!Array.isArray(result.equipment)) {
          throw new Error("Invalid equipment data received.");
        }

        setEquipment(result.equipment.slice(0, 6));
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEquipment();

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

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return (
    <main className="overflow-hidden bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 px-4 py-16 text-white sm:py-24 lg:py-32">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-12">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="min-w-0"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs sm:px-4 sm:text-sm">
              <Wrench size={16} />
              Your Equipment Rental Partner
            </span>

            <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:mt-7 sm:text-5xl lg:text-6xl">
              Rent the Right Equipment.

              <span className="mt-2 block text-indigo-200">
                Get More Done.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-indigo-100 sm:mt-6 sm:text-lg sm:leading-8">
              Discover, book and rent quality equipment with ease.
              EquipRent connects customers with equipment owners
              through one convenient platform.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/equipment"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 sm:w-auto sm:px-7 sm:text-base"
              >
                Browse Equipment
                <ArrowRight size={19} />
              </Link>

              <Link
                href="/dashboard/customer"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10 sm:w-auto sm:px-7 sm:text-base"
              >
                My Dashboard
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-indigo-100 sm:mt-10 sm:gap-7 sm:text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle size={17} />
                Easy Booking
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck size={17} />
                Approved Equipment
              </span>

              <span className="flex items-center gap-2">
                <Clock size={17} />
                Flexible Rental
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-5 md:p-8">
              <div className="rounded-xl bg-white p-5 text-gray-900 sm:rounded-2xl sm:p-8 md:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Wrench size={32} />
                </div>

                <h2 className="mt-5 text-xl font-bold sm:mt-7 sm:text-2xl">
                  Everything You Need
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
                  Find the right tools and equipment for your
                  projects, work and everyday needs.
                </p>

                <div className="mt-6 space-y-4 sm:mt-7">
                  {[
                    "Browse available equipment",
                    "Book your preferred dates",
                    "Manage your bookings online",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm font-medium"
                    >
                      <CheckCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-green-500"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Equipment */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Featured Equipment"
            title="Explore Available Equipment"
            description="Find equipment that matches your requirements and book it with ease."
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading featured equipment...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-white p-6 text-center sm:p-10">
              <AlertCircle
                size={38}
                className="mx-auto text-red-500"
              />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Unable to Load Equipment
              </h3>

              <p className="mt-2 break-words text-sm text-gray-600">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          ) : equipment.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center sm:p-10">
              <Package
                size={42}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 font-semibold text-gray-800">
                No Equipment Available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                No approved equipment is available right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {equipment.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  className="min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gray-100 sm:h-56">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package
                        size={60}
                        className="text-gray-300"
                      />
                    )}

                    <span className="absolute left-3 top-3 max-w-[80%] truncate rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow sm:left-4 sm:top-4">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                      {item.name}
                    </h3>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {item.brand} {item.model}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin
                        size={16}
                        className="shrink-0"
                      />
                      <span className="truncate">
                        {item.location}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-4">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">
                          Rental Price
                        </p>

                        <p className="text-lg font-bold text-indigo-600 sm:text-xl">
                          ৳{Number(item.rentalPrice).toLocaleString("en-BD")}
                          <span className="text-xs font-normal text-gray-500">
                            /{item.rentalType}
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/equipment/${item._id}`}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:px-4 sm:text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-9 text-center sm:mt-10">
            <Link
              href="/equipment"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 px-6 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white sm:w-auto"
            >
              View All Equipment
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Categories"
            title="Browse by Category"
            description="Explore different types of equipment available on EquipRent."
          />

          {categories.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              Equipment categories will appear here when available.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    href="/equipment"
                    className="group flex min-w-0 items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md sm:gap-4 sm:p-6"
                  >
                    <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white sm:p-4">
                      <Package size={25} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-gray-900">
                        {category}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Explore equipment
                      </p>
                    </div>

                    <ArrowRight
                      size={18}
                      className="ml-auto shrink-0 text-gray-400 transition group-hover:text-indigo-600"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why EquipRent"
            title="A Better Way to Rent Equipment"
            description="We make equipment discovery and rental management simple and convenient."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-7"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 sm:h-16 sm:w-16">
                    <Icon size={29} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-gray-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Simple Process"
            title="How EquipRent Works"
            description="Get started with just three simple steps."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="rounded-2xl border bg-white p-7 text-center shadow-sm sm:p-8"
                >
                  <span className="text-sm font-extrabold tracking-widest text-indigo-600">
                    STEP {step.number}
                  </span>

                  <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon size={30} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews - Demo Content */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Customer Feedback"
            title="What Customers Say"
            description="Example testimonials showing how customers can share their experience with EquipRent."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={17}
                      fill="currentColor"
                    />
                  ))}
                </div>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  &ldquo;{review.review}&rdquo;
                </p>

                <div className="mt-6 border-t pt-4">
                  <h3 className="font-bold text-gray-900">
                    {review.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {review.role} · Demo review
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-indigo-700 px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Truck
            size={40}
            className="mx-auto text-indigo-200"
          />

          <h2 className="mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">
            Ready to Find Your Equipment?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
            Explore available equipment and start your rental journey
            with EquipRent today.
          </p>

          <Link
            href="/equipment"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 font-bold text-indigo-700 transition hover:bg-indigo-50 sm:w-auto"
          >
            Get Started
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}
