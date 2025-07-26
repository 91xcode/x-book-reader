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
    'foliate-js', // 添加foliate-js到transpile列表
  ],
  experimental: {
    esmExternals: 'loose', // 允许ESM外部依赖
  },
  webpack: (config, { isServer }) => {
    // 支持top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // 处理foliate-js模块
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig; 