const env = {
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  databasePort: parseInt(process.env.DATABASE_PORT || '5432'),

  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  product: 'unicis-platform',
  redirectIfAuthenticated: '/teams',

  // Frontend Server
  port: parseInt(process.env.PORT || '4002'),
  nextAuthUrl: process.env.NEXTAUTH_URL!,
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  appUrl: process.env.APP_URL!,

  // NextAuth
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  // Email
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '1025'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },

  // Authentication
  authProviders: process.env.AUTH_PROVIDERS || 'email,credentials',
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },

  // SAML Jackson (legacy)
  saml: {
    issuer: 'https://saml.boxyhq.com',
    path: '/api/oauth/saml',
    callback: process.env.APP_URL!,
  },
  jackson: {
    url: process.env.JACKSON_URL,
    externalUrl: process.env.JACKSON_EXTERNAL_URL || process.env.JACKSON_URL,
    apiKey: process.env.JACKSON_API_KEY,
    productId: process.env.JACKSON_PRODUCT_ID || 'boxyhq',
    selfHosted: process.env.JACKSON_URL !== undefined,
    sso: {
      callback: process.env.APP_URL!,
      issuer: 'https://saml.boxyhq.com',
      path: '/api/oauth/saml',
      oidcPath: '/api/oauth/oidc',
      idpLoginPath: '/auth/idp-login',
    },
    dsync: {
      webhook_url: `${process.env.APP_URL}/api/webhooks/dsync`,
      webhook_secret: process.env.JACKSON_WEBHOOK_SECRET,
    },
  },

  // Application Features
  hideLandingPage: process.env.HIDE_LANDING_PAGE === 'true',
  confirmEmail: process.env.CONFIRM_EMAIL === 'true',
  disableNonBusinessEmailSignup: process.env.DISABLE_NON_BUSINESS_EMAIL_SIGNUP === 'true',
  groupPrefix: process.env.GROUP_PREFIX,

  // Team Features
  teamFeatures: {
    sso: process.env.FEATURE_TEAM_SSO !== 'false',
    dsync: process.env.FEATURE_TEAM_DSYNC !== 'false',
    auditLog: process.env.FEATURE_TEAM_AUDIT_LOG !== 'false',
    webhook: process.env.FEATURE_TEAM_WEBHOOK !== 'false',
    apiKey: process.env.FEATURE_TEAM_API_KEY !== 'false',
  },

  // Public Frontend Variables
  darkModeEnabled: process.env.NEXT_PUBLIC_DARK_MODE !== 'false',
  termsUrl: process.env.NEXT_PUBLIC_TERMS_URL,
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL,
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,

  // External Services
  svix: {
    url: process.env.SVIX_URL!,
    apiKey: process.env.SVIX_API_KEY!,
  },
  retraced: {
    url: process.env.RETRACED_URL
      ? `${process.env.RETRACED_URL}/auditlog`
      : undefined,
    apiKey: process.env.RETRACED_API_KEY,
    projectId: process.env.RETRACED_PROJECT_ID,
  },
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY || null,
    secretKey: process.env.RECAPTCHA_SECRET_KEY || null,
  },

  // OpenTelemetry
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
    headers: process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS,
    protocol: process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL || 'grpc',
    debug: process.env.OTEL_EXPORTER_DEBUG === 'true',
    prefix: process.env.OTEL_PREFIX || 'oscrat',
  },

  // Job Runner
  jobRunner: {
    port: parseInt(process.env.JOBRUNNER_PORT || '3001'),
    pollIntervalMs: parseInt(process.env.JOB_POLL_INTERVAL_MS || '5000'),
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
  },
};

export default env;