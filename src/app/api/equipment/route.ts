
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ||
  `${(
    process.env.BACKEND_URL ||
    (process.env.VERCEL
      ? "https://equip-rent-server.vercel.app"
      : "http://localhost:5000")
  ).replace(/\/+$/, "")}/api`
).replace(/\/+$/, "");

async function handleRequest(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const path = url.pathname.replace(/^\/api\/equipment/, "");

    const headers = new Headers();

    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("cookie", cookie);

    const authorization = request.headers.get("authorization");
    if (authorization) headers.set("authorization", authorization);

    let body: string | undefined;

    if (["POST", "PATCH", "PUT"].includes(request.method)) {
      headers.set("Content-Type", "application/json");
      body = await request.text();
    }

    const response = await fetch(
      `${BACKEND_API_URL}/equipment${path}${url.search}`,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      }
    );

    const responseText = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        success: false,
        message: responseText || "Invalid backend response.",
      };
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Equipment proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Backend connection failed.",
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}
