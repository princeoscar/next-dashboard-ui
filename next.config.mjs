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
  experimental: {
    cacheLife: {
      // 🎯 Fix for the "student" error
      student: {
        stale: 3600,
        revalidate: 60,
        expire: 86400,
      },
      teachers: {
        stale: 3600,    // How long to serve old data (1 hour)
        revalidate: 60, // How often to check for new data (1 minute)
        expire: 86400,  // When to completely delete (24 hours)
      },
      // 🎯 Fix for the "profile" error
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
  },
};

export default nextConfig;