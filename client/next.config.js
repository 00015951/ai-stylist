/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@twa-dev/sdk'],
  images: {
    // compound-beta returns images from many unpredictable domains (Pinterest, Vogue,
    // ASOS, Zara, Wildberries, etc.) — wildcard allows all HTTPS sources.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
