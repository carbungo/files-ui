import { NextRequest, NextResponse } from "next/server";
import { CarbonFilesClient } from "@carbonfiles/client";
import { setAuthToken } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  try {
    const client = new CarbonFilesClient({ baseUrl: process.env.API_URL!, apiKey: token });
    await client.dashboard.getCurrentUser();
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await setAuthToken(token);
  return NextResponse.json({ ok: true });
}
