import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    // Prevent Lit from loading its dev-mode build (which logs a console warning)
    if (config.resolve.conditionNames) {
      config.resolve.conditionNames = config.resolve.conditionNames.filter(
        (c: string) => c !== "development"
      );
    }
    return config;
  },
};

export default nextConfig;
