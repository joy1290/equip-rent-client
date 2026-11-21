import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// In-memory equipment store (for development; replace with DB in production)
let equipmentStore = [
  {
    id: "1",
    name: "Excavator",
    description: "Heavy digging equipment for construction sites",
    category: "Construction Equipment",
    location: "Dhaka, Bangladesh",
    rentalPrice: 5000,
    rentalType: "daily",
    availableQuantity: 3,
    condition: "Good",
    brand: "Caterpillar",
    model: "320D",
    image: "/placeholder-equipment.jpg",
    rentalTerms: "Requires operator license and security deposit.",
    status: "Approved",
  },
  {
    id: "2",
    name: "DSLR Camera",
    description: "Professional camera for photography and videography",
    category: "Photography Equipment",
    location: "Dhaka, Bangladesh",
    rentalPrice: 3000,
    rentalType: "daily",
    availableQuantity: 5,
    condition: "Like New",
    brand: "Canon",
    model: "EOS R5",
    image: "/placeholder-equipment.jpg",
    rentalTerms: "Memory cards not included. Insurance recommended.",
    status: "Approved",
  },
  {
    id: "3",
    name: "Passenger Van",
    description: "Comfortable van for group transportation",
    category: "Vehicles & Transportation",
    location: "Dhaka, Bangladesh",
    rentalPrice: 8000,
    rentalType: "weekly",
    availableQuantity: 2,
    condition: "Good",
    brand: "Toyota",
    model: "Hiace",
    image: "/placeholder-equipment.jpg",
    rentalTerms: "Driver must be above 25 years with valid license.",
    status: "Approved",
  },
  {
    id: "4",
    name: "Tiller",
    description: "Power tiller for soil preparation",
    category: "Agriculture Equipment",
    location: "Dhaka, Bangladesh",
    rentalPrice: 1500,
    rentalType: "daily",
    availableQuantity: 8,
    condition: "Good",
    brand: "Mahindra",
    model: "265 DI",
    image: "/placeholder-equipment.jpg",
    rentalTerms: "Fuel not included. Operating tutorial provided.",
    status: "Approved",
  },
  {
    id: "5",
    name: "Drone",
    description: "Aerial photography and videography drone",
    category: "Electronics",
    location: "Dhaka, Bangladesh",
    rentalPrice: 2000,
    rentalType: "daily",
    availableQuantity: 4,
    condition: "Like New",
    brand: "DJI",
    model: "Mavic 3 Pro",
    image: "/placeholder-equipment.jpg",
    rentalTerms: "FAA registration required. No-fly zones apply.",
    status: "Approved",
  },
  {
    id: "6",
    name: "Stage Lighting Set",
    description: "Professional lighting for events and parties",
    category: "Event Equipment",
    location: "Dhaka, Bangladesh",
    rentalPrice: 2500,
    rentalType: "daily",
    availableQuantity: 6,
    condition: "Good",
    brand: "Chauvet",
    model: "DMX Operator",
    image: "/placeholder-equipment.jpg",
    rentalTerms: "Power requirements must be verified on-site.",
    status: "Approved",
  },
];

// GET /api/equipment - Get all approved equipment with search, filters, sort, pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const rentalType = searchParams.get("rentalType") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const availability = searchParams.get("availability") || "";
    const sortBy = searchParams.get("sortBy") || "";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Filter equipment
    let items = equipmentStore.filter((item) => item.status === "Approved");

    // Apply search
    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.description.toLowerCase().includes(lowerSearch) ||
          item.category.toLowerCase().includes(lowerSearch) ||
          item.location.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply category filter
    if (category) {
      items = items.filter((item) => item.category === category);
    }

    // Apply rental type filter
    if (rentalType) {
      items = items.filter((item) => item.rentalType === rentalType);
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      items = items.filter(
        (item) => item.rentalPrice >= min && item.rentalPrice <= max
      );
    }

    // Apply availability filter
    if (availability === "in-stock") {
      items = items.filter((item) => item.availableQuantity > 0);
    }

    // Apply sorting
    items.sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortBy === "priceLow") {
        aVal = a.rentalPrice;
        bVal = b.rentalPrice;
      } else if (sortBy === "priceHigh") {
        aVal = b.rentalPrice;
        bVal = a.rentalPrice;
      } else if (sortBy === "recentlyAdded") {
        // Default sort by ID (simulating recency)
        aVal = parseInt(a.id) || 0;
        bVal = parseInt(b.id) || 0;
      } else {
        aVal = a.rentalPrice;
        bVal = b.rentalPrice;
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === "desc" ? comparison * -1 : comparison;
    });

    // Pagination
    const total = items.length;
    const paginatedItems = items.slice(skip, skip + limit);

    return NextResponse.json({
      equipment: paginatedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

// POST /api/equipment - Create new equipment (Owner/Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      category,
      location,
      rentalPrice,
      rentalType,
      availableQuantity,
      brand,
      model,
      condition,
      rentalTerms,
      image,
    } = body;

    const newEquipment = {
      id: Date.now().toString(),
      name,
      description,
      category,
      location,
      rentalPrice: Number(rentalPrice),
      rentalType,
      availableQuantity: Number(availableQuantity),
      brand,
      model,
      condition,
      rentalTerms,
      image: image || "/placeholder-equipment.jpg",
      status: "Pending", // New equipment starts as pending
      createdAt: new Date(),
    };

    equipmentStore.push(newEquipment);

    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}