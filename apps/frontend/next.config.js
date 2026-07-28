/* eslint @typescript-eslint/no-var-requires: "off" */

const { i18n } = require('./next-i18next.config');
const { withGlobalCss } = require('next-global-css');

const withConfig = withGlobalCss();

const isDev = process.env.NODE_ENV !== 'production';

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'wasm-unsafe-eval' is required by @react-pdf/renderer, whose layout engine
  // (yoga-layout) instantiates a WebAssembly module in the browser. Without it
  // every client-side PDF export fails outside dev, where 'unsafe-eval' happens
  // to cover it.
  `script-src 'self' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ''} https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://api.dicebear.com",
  `connect-src 'self'${isDev ? ' ws:' : ''} https://www.google.com/recaptcha/`,
  'frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/',
  ...(isDev ? [] : ['upgrade-insecure-requests']),
];

const reportDirectives = [
  'report-uri /api/csp-report',
  'report-to csp-endpoint',
];

const csp = [...cspDirectives, ...reportDirectives].join('; ');

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: csp,
  },
  {
    key: 'Reporting-Endpoints',
    value: 'csp-endpoint="/api/csp-report"',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

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
        headers: securityHeaders,
      },
      {
        // Next serves build output from its own static handler, which the
        // catch-all above never reaches.
        source: '/_next/static/:path*',
        locale: false,
        headers: securityHeaders,
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
