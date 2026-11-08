import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // the chat route reads content/bilal.md from disk — make sure it ships with the deploy
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
  images: {
    // 95 is used for the project screenshots so UI text stays crisp on the laptop screen
    qualities: [75, 95],
  },
};

export default nextConfig;
