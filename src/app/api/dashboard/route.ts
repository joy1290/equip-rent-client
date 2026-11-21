import { NextResponse } from "next/server";

// In-memory dashboard data store (for development; replace with DB in production)
let equipmentStore = [
  // Sample equipment for stats calculation
  {
    id: "1",
    name: "Excavator",
    category: "Construction Equipment",
    rentalPrice: 5000,
    rentalType: "daily",
    availableQuantity: 3,
    status: "Approved",
    ownerId: "owner1",
  },
  {
    id: "2",
    name: "DSLR Camera",
    category: "Photography Equipment",
    rentalPrice: 3000,
    rentalType: "daily",
    availableQuantity: 5,
    status: "Approved",
    ownerId: "owner1",
  },
  {
    id: "3",
    name: "Passenger Van",
    category: "Vehicles & Transportation",
    rentalPrice: 8000,
    rentalType: "weekly",
    availableQuantity: 2,
    status: "Approved",
    ownerId: "owner1",
  },
  {
    id: "4",
    name: "Tiller",
    category: "Agriculture Equipment",
    rentalPrice: 1500,
    rentalType: "daily",
    availableQuantity: 8,
    status: "Approved",
    ownerId: "owner2",
  },
  {
    id: "5",
    name: "Drone",
    category: "Electronics",
    rentalPrice: 2000,
    rentalType: "daily",
    availableQuantity: 4,
    status: "Approved",
    ownerId: "owner2",
  },
  {
    id: "6",
    name: "Stage Lighting Set",
    category: "Event Equipment",
    rentalPrice: 2500,
    rentalType: "daily",
    availableQuantity: 6,
    status: "Approved",
    ownerId: "owner3",
  },
];

let bookingsStore = [
  {
    id: "1",
    userId: "customer1",
    equipmentId: "1",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    quantity: 1,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",
    totalAmount: 25000,
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    userId: "customer2",
    equipmentId: "2",
    startDate: "2024-01-18",
    endDate: "2024-01-25",
    quantity: 1,
    bookingStatus: "Pending",
    paymentStatus: "Pending",
    totalAmount: 15000,
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    userId: "owner1",
    equipmentId: "1",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    quantity: 1,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",
    totalAmount: 25000,
    createdAt: "2024-01-20",
  },
];

let usersStore = [
  { id: "1", name: "Admin User", email: "admin@equiprent.com", role: "admin" },
  { id: "2", name: "Test Owner", email: "owner@equiprent.com", role: "owner" },
  { id: "3", name: "Test Customer", email: "customer@equiprent.com", role: "customer" },
];

// GET /api/dashboard/* - Dispatch based on pathname
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname; // /api/dashboard/stats, /api/dashboard/owner, /api/dashboard/admin/all-rentals

    // Stats endpoint
    if (pathname === "/api/dashboard/stats") {
      return await getStatsHandler(request);
    }

    // Owner endpoint
    if (pathname === "/api/dashboard/owner") {
      return await getOwnerHandler(request);
    }

    // Admin all-rentals endpoint
    if (pathname === "/api/dashboard/admin/all-rentals") {
      return await getAllRentalsHandler(request);
    }

    // Default: not found
    return NextResponse.json({ error: "Dashboard endpoint not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// GET /api/dashboard/stats - Get overall platform statistics
async function getStatsHandler(request: Request) {
  try {
    const totalUsers = usersStore.length;
    const totalEquipment = equipmentStore.filter(
      (item) => item.status === "Approved"
    ).length;
    const totalBookings = bookingsStore.length;
    const pendingEquipment = equipmentStore.filter(
      (item) => item.status === "Pending"
    ).length;
    const approvedEquipment = equipmentStore.filter(
      (item) => item.status === "Approved"
    ).length;
    const rejectedEquipment = equipmentStore.filter(
      (item) => item.status === "Rejected"
    ).length;
    const paidBookings = bookingsFilter.filter(
      (b) => b.paymentStatus === "Paid"
    ).length;
    const totalRevenue = bookingsFilter
      .filter((b) => b.paymentStatus === "Paid")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Monthly booking stats (current month)
    const now = new Date();
    const currentMonthBookings = bookingsFilter.filter(
      (b) => {
        const date = new Date(b.createdAt);
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      }
    );

    return NextResponse.json({
      totalUsers,
      totalEquipment,
      totalBookings,
      pendingEquipment,
      approvedEquipment,
      rejectedEquipment,
      paidBookings,
      totalRevenue,
      monthlyBookings: currentMonthBookings.length,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

// Helper to filter bookings by payment status
const bookingsFilter = bookingsStore.filter(
  (b) => b.paymentStatus !== undefined
);

// GET /api/dashboard/owner - Get owner's dashboard stats
async function getOwnerHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId") || "";

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID required" },
        { status: 400 }
      );
    }

    // Get owner's equipment
    const ownerEquipment = equipmentStore.filter(
      (item) => item.ownerId === ownerId
    );

    const totalListedEquipment = ownerEquipment.length;
    const ownerBookings = bookingsFilter.filter(
      (b) => b.userId !== ownerId
    );

    // Simplified: count bookings where equipment matches owner's equipment
    const ownerEquipmentIds = ownerEquipment.map((e) => e.id);
    const ownerRentals = bookingsFilter.filter((b) =>
      ownerEquipmentIds.includes(b.equipmentId)
    );

    const completedRentals = ownerRentals.filter(
      (b) => b.paymentStatus === "Paid"
    ).length;
    const totalEarnings = ownerRentals
      .filter((b) => b.paymentStatus === "Paid")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Monthly earnings
    const now = new Date();
    const monthlyEarnings = ownerRentals
      .filter(
        (b) =>
          new Date(b.createdAt).getFullYear() === now.getFullYear() &&
          new Date(b.createdAt).getMonth() === now.getMonth() &&
          b.paymentStatus === "Paid"
      )
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return NextResponse.json({
      totalListedEquipment,
      completedRentals,
      totalEarnings,
      monthlyEarnings,
    });
  } catch (error) {
    console.error("Error fetching owner dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch owner dashboard stats" },
      { status: 500 }
    );
  }
}

// GET /api/dashboard/admin/all-rentals - Get all rentals (Admin only)
async function getAllRentalsHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    let rentals = [...bookingsStore];

    if (status) {
      rentals = rentals.filter((b) => b.bookingStatus === status);
    }

    if (paymentStatus) {
      rentals = rentals.filter((b) => b.paymentStatus === paymentStatus);
    }

    // Enrich with user and equipment info
    const enrichedRentals = rentals.map((b) => {
      const user = usersStore.find((u) => u.id === b.userId);
      const equipment = equipmentStore.find((e) => e.id === b.equipmentId);
      return { ...b, user, equipment };
    });

    return NextResponse.json(enrichedRentals);
  } catch (error) {
    console.error("Error fetching all rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch all rentals" },
      { status: 500 }
    );
  }
}