import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 95 is used for the project screenshots so UI text stays crisp on the laptop screen
    qualities: [75, 95],
  },
};

export default nextConfig;
