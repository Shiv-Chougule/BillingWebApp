import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❗ This allows Vercel build to succeed even if ESLint finds errors
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'images.pexels.com'], // Add more domains if needed
  },
};