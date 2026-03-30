import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/sec-ad-admin',
        destination: '/',
      },
      {
        source: '/sec-ad-admin/:path*',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
