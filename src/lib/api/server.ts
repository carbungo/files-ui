import { CarbonFilesClient } from "@carbonfiles/client";
import { getAuthToken } from "@/lib/auth/cookies";

export async function getServerClient() {
  const token = await getAuthToken();
  return new CarbonFilesClient({
    baseUrl: process.env.API_URL!,
    apiKey: token,
  });
}
