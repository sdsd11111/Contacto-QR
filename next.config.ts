import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* output: 'export', // Revertido para Vercel (SSR activo) */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
