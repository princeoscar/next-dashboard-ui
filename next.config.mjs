/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. Clerk Elements Fix: Ensures the beta package is compiled correctly
    transpilePackages: ["@clerk/elements"],
    
    images: {
        unoptimized: true, 
        remotePatterns: [
            {
                hostname: "images.pexels.com",
            },
            {
                hostname: "res.cloudinary.com",
            },
        ],
    },
    // 2. Production Stability: Prevents build failure on minor linting/TS issues
    typescript: {
        ignoreBuildErrors: false, // Keep this false to ensure code quality
    },
};

export default nextConfig;