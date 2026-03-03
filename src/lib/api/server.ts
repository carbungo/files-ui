import { cookies } from "next/headers";
import { createClient } from "./generated/client/client.gen";

export async function getServerClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cf-auth-token")?.value;
  const serverClient = createClient({ baseUrl: process.env.API_URL! });
  if (token) {
    serverClient.interceptors.request.use((req) => {
      req.headers.set("Authorization", `Bearer ${token}`);
      return req;
    });
  }
  return serverClient;
}
