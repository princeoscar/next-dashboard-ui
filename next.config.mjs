/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this section
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
        dns: false,
      };
    }
    return config;
  },
};

export default nextConfig;