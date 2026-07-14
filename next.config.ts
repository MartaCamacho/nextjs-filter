import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the project root explicitly: Next.js otherwise walks up looking
    // for a lockfile and can pick up an unrelated one outside this repo.
    root: import.meta.dirname,
  },
};

export default nextConfig;
