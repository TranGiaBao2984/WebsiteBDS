import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bật tính năng Cache Components ("use cache") cho Next.js 16
  experimental: {
    cacheComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "jclbxsnsorfotwndpxle.supabase.co",
      },
      {
        protocol: "https",
        hostname: "your-supabase-project.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;