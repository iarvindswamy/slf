/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporary: allow deploy while API/admin is incomplete
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
