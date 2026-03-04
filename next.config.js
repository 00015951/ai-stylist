/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@twa-dev/sdk'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'raslov.ua' },
      { protocol: 'https', hostname: 'www.myfashionlife.com' },
      { protocol: 'https', hostname: 'techwear-outfits.com' },
      { protocol: 'https', hostname: 'stockmann.ru' },
      { protocol: 'https', hostname: 'pin.it' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'careerpath.pro' },
    ],
  },
};

module.exports = nextConfig;
