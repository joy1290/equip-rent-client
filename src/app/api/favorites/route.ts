import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// In-memory favorites store (for development; replace with MongoDB in production)
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
    const { data: session } = await authClient.useSession();

    if (!session?.user) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const userFavorites = favoritesStore.filter(
      (f) => f.userId === session.user.id
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
    const { data: session } = await authClient.useSession();

    if (!session?.user) {
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
      (f) => f.userId === session.user.id && f.equipmentId === equipmentId
    );

    if (alreadyFavorited) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }

    const newFavorite = {
      id: Date.now().toString(),
      userId: session.user.id,
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
    const { data: session } = await authClient.useSession();

    if (!session?.user) {
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
      (f) => !(f.userId === session.user.id && f.equipmentId === equipmentId)
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

/**
 * MongoDB Alternative Implementation:
 * 
 * If you have mongoose installed, replace the in-memory store with:
 * 
 * import mongoose from "mongoose";
 * 
 * const FavoriteSchema = new mongoose.Schema({
 *   userId: { type: String, required: true },
 *   equipmentId: { type: String, required: true },
 *   favoritedAt: { type: Date, default: Date.now },
 * });
 * 
 * const Favorite = mongoose.model("Favorite", FavoriteSchema);
 * 
 * // GET /api/favorites
 * export async function GET(request: Request) {
 *   const { data: session } = await authClient.useSession();
 *   const userId = session?.user?.id;
 *   const favorites = await Favorite.find({ userId });
 *   return NextResponse.json(favorites);
 * }
 * 
 * // POST /api/favorites
 * export async function POST(request: Request) {
 *   const { data: session } = await authClient.useSession();
 *   const { equipmentId } = await request.json();
 *   const userId = session?.user?.id;
 * 
 *   // Check duplicate
 *   const exists = await Favorite.findOne({ userId, equipmentId });
 *   if (exists) return NextResponse.json({ error: "Already favorited" }, { status: 409 });
 * 
 *   const favorite = new Favorite({ userId, equipmentId });
 *   await favorite.save();
 *   return NextResponse.json(favorite, { status: 201 });
 * }
 * 
 * // DELETE /api/favorites/[id]
 * export async function DELETE(request: Request) {
 *   const { data: session } = await authClient.useSession();
 *   const { equipmentId } = new URL(request).pathname.split("/");
 *   const userId = session?.user?.id;
 *   
 *   await Favorite.deleteOne({ userId, equipmentId });
 *   return NextResponse.json({ success: true });
 * }
 */