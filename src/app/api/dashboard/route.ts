
import { NextResponse } from "next/server";



// In-memory dashboard data store (development only)
const equipmentStore = [
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

const bookingsStore = [
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

const usersStore = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@equiprent.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Test Owner",
    email: "owner@equiprent.com",
    role: "owner",
  },
  {
    id: "3",
    name: "Test Customer",
    email: "customer@equiprent.com",
    role: "customer",
  },
];

const bookingsFilter = bookingsStore.filter(
  (booking) => booking.paymentStatus !== undefined
);

// GET /api/dashboard/*
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/api/dashboard/stats") {
      return getStatsHandler();
    }

    if (pathname === "/api/dashboard/owner") {
      return getOwnerHandler(request);
    }

    if (pathname === "/api/dashboard/admin/all-rentals") {
      return getAllRentalsHandler(request);
    }

    return NextResponse.json(
      { error: "Dashboard endpoint not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Dashboard statistics
async function getStatsHandler() {
  try {
    const totalUsers = usersStore.length;

    const approvedEquipment = equipmentStore.filter(
      (item) => item.status === "Approved"
    ).length;

    const pendingEquipment = equipmentStore.filter(
      (item) => item.status === "Pending"
    ).length;

    const rejectedEquipment = equipmentStore.filter(
      (item) => item.status === "Rejected"
    ).length;

    const paidBookings = bookingsFilter.filter(
      (booking) => booking.paymentStatus === "Paid"
    );

    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const now = new Date();

    const monthlyBookings = bookingsFilter.filter((booking) => {
      const date = new Date(booking.createdAt);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;

    return NextResponse.json({
      totalUsers,
      totalEquipment: approvedEquipment,
      totalBookings: bookingsStore.length,
      pendingEquipment,
      approvedEquipment,
      rejectedEquipment,
      paidBookings: paidBookings.length,
      totalRevenue,
      monthlyBookings,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);

    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

// Owner dashboard
async function getOwnerHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID required" },
        { status: 400 }
      );
    }

    const ownerEquipment = equipmentStore.filter(
      (item) => item.ownerId === ownerId
    );

    const ownerEquipmentIds = ownerEquipment.map(
      (equipment) => equipment.id
    );

    const ownerRentals = bookingsFilter.filter((booking) =>
      ownerEquipmentIds.includes(booking.equipmentId)
    );

    const paidRentals = ownerRentals.filter(
      (booking) => booking.paymentStatus === "Paid"
    );

    const totalEarnings = paidRentals.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const now = new Date();

    const monthlyEarnings = paidRentals
      .filter((booking) => {
        const date = new Date(booking.createdAt);

        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return NextResponse.json({
      totalListedEquipment: ownerEquipment.length,
      completedRentals: paidRentals.length,
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

// Admin rentals
async function getAllRentalsHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    let rentals = [...bookingsStore];

    if (status) {
      rentals = rentals.filter(
        (booking) => booking.bookingStatus === status
      );
    }

    if (paymentStatus) {
      rentals = rentals.filter(
        (booking) => booking.paymentStatus === paymentStatus
      );
    }

    const enrichedRentals = rentals.map((booking) => {
      const user = usersStore.find(
        (item) => item.id === booking.userId
      );

      const equipment = equipmentStore.find(
        (item) => item.id === booking.equipmentId
      );

      return {
        ...booking,
        user,
        equipment,
      };
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
