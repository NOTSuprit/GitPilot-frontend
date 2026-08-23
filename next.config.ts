import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://gitpilot-backend-gqlq.onrender.com/api/:path*",
      },
      {
        source: "/oauth2/:path*",
        destination: "https://gitpilot-backend-gqlq.onrender.com/oauth2/:path*",
      },
      {
        source: "/login/:path*",
        destination: "https://gitpilot-backend-gqlq.onrender.com/login/:path*",
      },
    ];
  },
};

export default nextConfig;