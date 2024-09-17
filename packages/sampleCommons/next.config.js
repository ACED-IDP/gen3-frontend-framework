'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./src/lib/plugins/index.js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Next configuration with support for rewrting API to existing common services
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.cancerresearchuk.org',
        port: '',
        pathname: '/sites/default/files/aced_website_header.jpg',
      },
    ],
  },
  experimental: {
    esmExternals: true,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  transpilePackages: ['@gen3/frontend'],
  basePath: process.env.BASE_PATH || '',
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)?', // Matches all pages
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
  async redirects() {
    const redirects = [];
    if (process.env.GEN3_COMMONS_NAME == 'cbds') {
      redirects.push({
        source: '/',
        destination: '/cbdsLandingPage',
        permanent: true,
      });
    }
    return redirects;
  },
};

module.exports = withMDX(nextConfig);
