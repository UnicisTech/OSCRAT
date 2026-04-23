/* eslint @typescript-eslint/no-var-requires: "off" */

const { i18n } = require('./next-i18next.config');
const { withGlobalCss } = require('next-global-css');

const withConfig = withGlobalCss();

// Redirect root url to login page; legacy /teams/* → /organization/*
const redirects = [
  {
    source: '/teams/:path*',
    destination: '/organization/:path*',
    permanent: true,
  },
  {
    source: '/teams',
    destination: '/organization',
    permanent: true,
  },
  {
    source: '/',
    destination: '/auth/login',
    permanent: true,
  },
];

/** @type {import('next').NextConfig} */
module.exports = withConfig({
  reactStrictMode: false,
  transpilePackages: ['@oscrat/model', '@mdxeditor/editor'],
  serverExternalPackages: ['@prisma/client'],
  i18n,
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Handle Prisma and node: imports
    if (!isServer) {
      // Client-side: prevent bundling server-only packages
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        'node:async_hooks': false,
        'node:buffer': false,
        'node:crypto': false,
        'node:fs': false,
        'node:http': false,
        'node:https': false,
        'node:net': false,
        'node:os': false,
        'node:path': false,
        'node:stream': false,
        'node:tls': false,
        'node:url': false,
        'node:util': false,
        'node:zlib': false,
      };
    }

    // Server-side: externalize Prisma
    if (isServer) {
      config.externals.push('@prisma/client');
    }

    return config;
  },
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/.well-known/saml.cer',
        destination: '/api/well-known/saml.cer',
      },
      {
        source: '/.well-known/saml-configuration',
        destination: '/well-known/saml-configuration',
      },
    ];
  },
});
