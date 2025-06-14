/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 24000000, // 24 MiB, just under Cloudflare's 25 MiB limit
      };
    }
    return config;
  },
};

export default nextConfig;
