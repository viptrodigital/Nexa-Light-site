import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shared hosting limits processes: build with a single worker.
  experimental: { cpus: 1 },
  images: {
    // WebP only: AVIF encoding is slow on shared hosting CPUs.
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "nexalight.in" },
      { protocol: "https", hostname: "www.nexalight.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "rgqcfplwuxmdpvnioapg.supabase.co" },
    ],
  },
  async redirects() {
    // Old category links (/products?cat=...) now have their own pages.
    const divisions: [string, string][] = [
      ["Facade Lighting", "facade-lighting"],
      ["Fiber Optic Lighting", "fiber-optic-lighting"],
      ["Landscape Lighting", "landscape-lighting"],
      ["Indoor Architectural Lighting", "indoor-architectural-lighting"],
    ];
    // The previous admin panel stays available as a fallback (its scripts use relative paths).
    const legacy = { source: "/admin-legacy", destination: "/admin-legacy/index.html", permanent: false };
    return [legacy, ...divisions.map(([cat, slug]) => ({
      source: "/products",
      has: [{ type: "query" as const, key: "cat", value: cat }],
      destination: `/products/${slug}`,
      permanent: true,
    }))];
  },
};

export default nextConfig;
