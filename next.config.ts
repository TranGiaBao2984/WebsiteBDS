import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "jclbxsnsorfotwndpxle.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/sanpham",
        destination: "/properties",
        permanent: true,
      },
      {
        source: "/sanpham/:id",
        destination: "/properties/:id",
        permanent: true,
      },
      {
        source: "/vetoi",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;