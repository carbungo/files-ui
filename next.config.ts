import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:5239";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
  async rewrites() {
    return [
      // SignalR hub - supports WebSocket upgrade
      {
        source: "/hub/:path*",
        destination: `${apiUrl}/hub/:path*`,
      },
    ];
  },
};

export default nextConfig;
