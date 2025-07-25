/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  transpilePackages: [
    'react-i18next',
    'i18next',
    'i18next-browser-languagedetector',
    'highlight.js',
    'marked',
  ],
};

export default nextConfig; 