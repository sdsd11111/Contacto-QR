import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* output: 'export', // Revertido para Vercel (SSR activo) */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
