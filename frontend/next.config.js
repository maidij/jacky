/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://10.224.205.37:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
