import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// In-memory fallback store (for development; replace with MongoDB in production)
let favoritesStore = [
  // Sample favorites for testing
  {
    id: "1",
    userId: "customer1",
    equipmentId: "1",
  },
  {
    id: "2",
    userId: "customer1",
    equipmentId: "2",
  },
  {
    id: "3",
    userId: "customer2",
    equipmentId: "3",
  },
];

// GET /api/favorites - Get current user's favorites
export async function GET(request: Request) {
  try {
    const { data } = await authClient.useSession();

    if (!data?.user) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const userFavorites = favoritesStore.filter(
      (f) => f.userId === data.user.id
    );

    return NextResponse.json({ favorites: userFavorites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a favorite
export async function POST(request: Request) {
  try {
    const { data } = await authClient.useSession();

    if (!data?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { equipmentId } = await request.json();

    if (!equipmentId) {
      return NextResponse.json(
        { error: "Equipment ID required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const alreadyFavorited = favoritesStore.some(
      (f) => f.userId === data.user.id && f.equipmentId === equipmentId
    );

    if (alreadyFavorited) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }

    const newFavorite = {
      id: Date.now().toString(),
      userId: data.user.id,
      equipmentId,
    };

    favoritesStore.push(newFavorite);

    return NextResponse.json(newFavorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites/[id] - Remove a favorite
export async function DELETE(request: Request) {
  try {
    const { data } = await authClient.useSession();

    if (!data?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const equipmentId = url.pathname.split("/").pop();

    if (!equipmentId) {
      return NextResponse.json(
        { error: "Equipment ID required" },
        { status: 400 }
      );
    }

    // Remove the favorite
    const beforeLength = favoritesStore.length;
    favoritesStore = favoritesStore.filter(
      (f) => !(f.userId === data.user.id && f.equipmentId === equipmentId)
    );

    const afterLength = favoritesStore.length;

    if (beforeLength === afterLength) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}