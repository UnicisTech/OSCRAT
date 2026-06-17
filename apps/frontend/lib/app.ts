import packageInfo from '../package.json';

const app = {
  version: packageInfo.version,
  name: 'Oscrat',
  logoUrl: '/logo-oscrat.svg',
  // Raster logo for emails: most mail clients (Gmail, Outlook) do not render SVG.
  emailLogoUrl: '/logo-oscrat.png',
  url: 'http://localhost:3002',
};

export default app;
