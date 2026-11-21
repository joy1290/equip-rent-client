import { NextResponse } from "next/server";

// In-memory user store (for development; replace with DB in production)
let usersStore = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@equiprent.com",
    role: "admin",
    image: "/placeholder-user.jpg",
  },
  {
    id: "2",
    name: "Test Owner",
    email: "owner@equiprent.com",
    role: "owner",
    image: "/placeholder-user.jpg",
  },
  {
    id: "3",
    name: "Test Customer",
    email: "customer@equiprent.com",
    role: "customer",
    image: "/placeholder-user.jpg",
  },
];

// GET /api/users - Get all users (Admin only)
export async function GET(request: Request) {
  try {
    return NextResponse.json(usersStore);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/:id/role - Change user role (Admin only)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    const role = searchParams.get("role") || "";

    if (!id || !["customer", "owner", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid user ID or role" },
        { status: 400 }
      );
    }

    const user = usersStore.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    user.role = role;

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}