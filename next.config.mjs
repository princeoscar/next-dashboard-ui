/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true, // ⬅️ Required for Mobile/Capacitor
        remotePatterns: [
            {
                hostname: "images.pexels.com",
            },
            {
                hostname: "res.cloudinary.com",
            },
        ],
    },
};

export default nextConfig;