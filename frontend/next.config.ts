import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    agentUpgrade: false as any,
  },
};

export default nextConfig;
