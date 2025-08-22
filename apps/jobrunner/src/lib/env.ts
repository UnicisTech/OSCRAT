const env = {
  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // Job Runner specific
  jobRunner: {
    port: parseInt(process.env.JOBRUNNER_PORT || '3001'),
    pollIntervalMs: parseInt(process.env.JOB_POLL_INTERVAL_MS || '5000'),
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
  },

  // Workspace
  workspaceRoot:
    process.env.JOBRUNNER_WORKSPACE_ROOT || '/tmp/jobrunner-workspace',
};

export default env;
