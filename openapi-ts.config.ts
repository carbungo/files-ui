import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:5239/openapi/v1.json",
  output: {
    path: "src/lib/api/generated",
    postProcess: ["prettier"],
  },
  plugins: [
    {
      name: "@hey-api/typescript",
      enums: false,
    },
    {
      name: "@hey-api/sdk",
    },
    {
      name: "@hey-api/client-fetch",
    },
  ],
});
