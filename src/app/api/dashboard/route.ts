
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL;

async function proxyRequest(
  request: NextRequest,
  method: "GET" | "PATCH"
) {
  if (!API_URL) {
    return NextResponse.json(
      { success: false, message: "Backend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const headers = new Headers();

    const cookie = request.headers.get("cookie");
    const authorization = request.headers.get("authorization");

    if (cookie) headers.set("cookie", cookie);
    if (authorization) headers.set("authorization", authorization);

    let body: string | undefined;

    if (method === "PATCH") {
      headers.set("Content-Type", "application/json");
      body = await request.text();
    }

    const response = await fetch(`${API_URL}/users${new URL(request.url).pathname.replace("/api/users", "")}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Users API proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to connect to backend server." },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "PATCH");
}
