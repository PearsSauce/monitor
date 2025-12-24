import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: false, // Disable compression to support SSE streaming
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
};

export default nextConfig;
