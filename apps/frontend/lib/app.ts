import packageInfo from '../package.json';

const app = {
  version: packageInfo.version,
  name: 'Oscrat',
  logoUrl: '/logo-oscrat.svg',
  // Raster logo for emails: most mail clients (Gmail, Outlook) do not render SVG.
  // The `?v=` suffix is a cache-buster for Brevo's image proxy, which
  // fingerprints images by source URL and caches indefinitely (including
  // failed fetches). Bump this whenever the logo file changes or you need
  // to force Brevo to refetch.
  emailLogoUrl: '/logo-oscrat.png?v=2',
  url: 'http://localhost:3002',
};

export default app;
