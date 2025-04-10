/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Убедиться, что favicon.ico и другие файлы включены в сборку
  webpack(config) {
    return config;
  },
}

module.exports = nextConfig