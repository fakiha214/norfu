import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/banner images are managed from the admin panel and may live
    // on any image host (Cloudinary, ImageKit, Vercel Blob, ...).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
