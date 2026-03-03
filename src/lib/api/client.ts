import { client } from "./generated/client.gen";

export function configureApiClient(baseUrl: string, token?: string) {
  client.setConfig({ baseUrl });
  if (token) {
    client.interceptors.request.use((req) => {
      req.headers.set("Authorization", `Bearer ${token}`);
      return req;
    });
  }
}

export { client };
export * from "./generated/sdk.gen";
export type * from "./generated/types.gen";
