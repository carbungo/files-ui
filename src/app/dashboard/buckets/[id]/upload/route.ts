import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/cookies";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.arrayBuffer();
  const contentType = request.headers.get("content-type") ?? "application/octet-stream";

  const res = await fetch(`${process.env.API_URL}/api/buckets/${id}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }

  const body = await request.arrayBuffer();
  const contentType = request.headers.get("content-type") ?? "application/octet-stream";

  const res = await fetch(
    `${process.env.API_URL}/api/buckets/${id}/upload/stream?filename=${encodeURIComponent(filename)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
      },
      body,
    },
  );

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
