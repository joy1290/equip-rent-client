import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// MongoDB Favorite model - using mongoose for MongoDB persistence
// Install: npm i mongoose
// Ensure MONGODB_URI is set in environment

import mongoose from "mongoose";

// In production, use a proper DB module. For now, connect on demand.
let cachedMongoose = { conn: null, promise: null };

async function connectToDatabase() {
  if (cachedMongoose.conn) return cachedMongoose.conn;
  if (!cachedMongoose.promise) {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/equip-rent";
    cachedMongoose.promise = mongoose.connect(uri).then((m) => m);
  }
  cachedMongoose.conn = await cachedMongoose.promise;
  return cachedMongoose.conn;
}

// Define Favorite schema and model
function getFavoriteModel() {
  const conn = await connectToDatabase();
  if (!conn.models?.Favorite) {
    const FavoriteSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      equipmentId: { type: String, required: true },
      favoritedAt: { type: Date, default: Date.now },
    });
    conn.model("Favorite", FavoriteSchema);
  }
  return conn.model("Favorite");
}

// GET /api/favorites - Get current user's favorites
export async function GET(request: Request) {
  try {
    const { data: session } = await authClient.useSession();

    if (!session?.user) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const Favorite = getFavoriteModel();
    const userFavorites = await Favorite.find({ userId: session.user.id })
      .sort({ favoritedAt: -1 })
      .lean();

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
    const Favorite = getFavoriteModel();
    const alreadyFavorited = await Favorite.findOne({
      userId: session.user.id,
      equipmentId,
    });

    if (alreadyFavorited) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }

    const newFavorite = new Favorite({
      userId: session.user.id,
      equipmentId,
    });

    await newFavorite.save();

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

    // Remove the favorite from MongoDB
    const Favorite = getFavoriteModel();
    const result = await Favorite.deleteOne({
      userId: session.user.id,
      equipmentId,
    });

    if (result.deletedCount === 0) {
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