/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma / server external packages (new way)
  serverExternalPackages: ["@prisma/client"],

  
  turbopack: {},

  
};

export default nextConfig;