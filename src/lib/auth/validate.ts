import { getAuthToken } from "./cookies";

export interface AuthState {
  authenticated: boolean;
  expiresAt?: string;
}

export async function validateAuth(): Promise<AuthState> {
  const token = await getAuthToken();
  if (!token) return { authenticated: false };
  try {
    const res = await fetch(`${process.env.API_URL}/api/tokens/dashboard/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { authenticated: false };
    const data = await res.json();
    return { authenticated: true, expiresAt: data.expires_at };
  } catch {
    return { authenticated: false };
  }
}
