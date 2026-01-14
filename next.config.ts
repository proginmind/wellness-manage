import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure image domains if needed
  images: {
    remotePatterns: [
      // Add remote image patterns here
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },

  // Experimental features (optional)
  experimental: {
    // typedRoutes: true,
  },
};

export default nextConfig;
