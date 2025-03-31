import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: ["@twa-dev/sdk"],
  basePath: '/velospbot',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    return config;
  },
  optimizeFonts: false,
};

export default nextConfig;
