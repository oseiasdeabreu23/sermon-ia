/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('firebase-admin', '@anthropic-ai/sdk');
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
        fs: false,
      };
    }
    return config;
  },
  transpilePackages: ['firebase', '@firebase/auth'],
}

module.exports = nextConfig
