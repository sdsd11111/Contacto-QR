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
  async rewrites() {
    return [
      {
        source: '/audit/:path*',
        destination: 'https://activaqr2.vercel.app/audit/:path*',
      },
    ];
  },
};

export default nextConfig;
