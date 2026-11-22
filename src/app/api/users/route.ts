import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

async function handleRequest(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { success: false, message: "BACKEND_API_URL is missing" },
      { status: 500 }
    );
  }

  try {
    const path = new URL(request.url).pathname.replace(/^\/api\/users/, "");
    const headers = new Headers();

    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("cookie", cookie);

    const authorization = request.headers.get("authorization");
    if (authorization) headers.set("authorization", authorization);

    const method = request.method;
    let body: string | undefined;

    if (method === "PATCH") {
      headers.set("Content-Type", "application/json");
      body = await request.text();
    }

    const response = await fetch(
      `${BACKEND_URL}/users${path}`,
      {
        method,
        headers,
        body,
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Users proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Backend connection failed" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}