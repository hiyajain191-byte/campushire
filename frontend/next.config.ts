
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://campushire-xl9m.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;

