import { NextRequest, NextResponse } from "next/server";
import { setAuthToken } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const res = await fetch(`${process.env.API_URL}/api/tokens/dashboard/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await setAuthToken(token);
  return NextResponse.json({ ok: true });
}
