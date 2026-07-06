/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  // 🎯 Moved OUT of experimental
  cacheLife: {
    student: {
      stale: 3600,
      revalidate: 60,
      expire: 86400,
    },
    teachers: {
      stale: 3600,
      revalidate: 60,
      expire: 86400,
    },
    profile: {
      stale: 3600,
      revalidate: 60,
      expire: 86400,
    },
    "dashboard-stats": {
      stale: 3600,
      revalidate: 60,
      expire: 86400,
    },
  },
  experimental: {
    // Keep any truly experimental features here if you have them
  },
};

export default nextConfig;