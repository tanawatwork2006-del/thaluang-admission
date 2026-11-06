const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/**/*'],
    },
  },
};

module.exports = nextConfig;
