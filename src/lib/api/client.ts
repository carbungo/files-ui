import { CarbonFilesClient } from "@carbonfiles/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function createApiClient(token?: string) {
  return new CarbonFilesClient({
    baseUrl: API_URL,
    apiKey: token,
  });
}

export { CarbonFilesClient, CarbonFilesError } from "@carbonfiles/client";
export type * from "@carbonfiles/client";
