import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// In-memory booking store (for development; replace with DB in production)
let bookingsStore = [
  {
    id: "1",
    userId: "user_1",
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
    userId: "user_2",
    equipmentId: "2",
    startDate: "2024-01-18",
    endDate: "2024-01-25",
    quantity: 1,
    bookingStatus: "Pending",
    paymentStatus: "Pending",
    totalAmount: 15000,
    createdAt: "2024-01-12",
  },
];

// GET /api/bookings/my-bookings - Get current user's bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    // If no user is authenticated, return empty
    const { data: session } = await authClient.useSession();

    if (!session?.user) {
      return NextResponse.json([]);
    }

    let userBookings = bookingsStore.filter(
      (b) => b.userId === session.user.id
    );

    if (status) {
      userBookings = userBookings.filter(
        (b) => b.bookingStatus === status
      );
    }

    if (paymentStatus) {
      userBookings = userBookings.filter(
        (b) => b.paymentStatus === paymentStatus
      );
    }

    // Sort by date descending
    userBookings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(userBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      equipmentId,
      startDate,
      endDate,
      quantity,
      contactNumber,
      deliveryAddress,
      additionalNotes,
    } = body;

    // If no user is authenticated, return error
    const { data: session } = await authClient.useSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find equipment
    const equipment = bookingsStore.find(
      (b) => b.equipmentId === equipmentId
    );

    if (!equipment) {
      // Try to find from equipment list - we'll just proceed
      // In a real app, check against equipment DB
    }

    // Skip available quantity check for in-memory store
    // In a real app, check against equipment DB

    const totalAmount = 5000 * quantity; // Simplified calculation

    const newBooking = {
      id: Date.now().toString(),
      userId: session.user.id,
      equipmentId,
      startDate,
      endDate,
      quantity,
      contactNumber,
      deliveryAddress,
      additionalNotes,
      bookingStatus: "Pending",
      paymentStatus: "Pending",
      totalAmount: Number(totalAmount),
      createdAt: new Date().toISOString(),
    };

    bookingsStore.push(newBooking);

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}