export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    forgot: ['auth', 'forgot-password'] as const,
    reset: ['auth', 'reset-password'] as const,
    join: ['auth', 'join'] as const,
    sso: {
      all: ['auth', 'sso'] as const,
      verify: () => [...queryKeys.auth.sso.all, 'verify'] as const,
    },
  },
  oauth: {
    all: ['oauth'] as const,
    token: ['oauth', 'token'] as const,
    userinfo: ['oauth', 'userinfo'] as const,
  },
  password: ['password'] as const,
  users: ['users'] as const,
  health: ['health'] as const,
  idp: ['idp'] as const,
  invitations: {
    all: ['invitations'] as const,
    detail: (token: string) => ['invitations', token] as const,
  },
  teams: {
    all: ['teams'] as const,
    detail: (slug: string) => ['teams', slug] as const,
    members: (slug: string) => ['teams', slug, 'members'] as const,
    invitations: (slug: string) => ['teams', slug, 'invitations'] as const,
    webhooks: (slug: string) => ['teams', slug, 'webhooks'] as const,
    directory: (slug: string) => ['teams', slug, 'directory'] as const,
    permissions: (slug: string) => ['teams', slug, 'permissions'] as const,
    saml: (slug: string) => ['teams', slug, 'saml'] as const,
    csc: {
      statuses: (slug: string) => ['teams', slug, 'csc', 'statuses'] as const,
      controls: (slug: string) => ['teams', slug, 'csc', 'controls'] as const,
      iso: (slug: string) => ['teams', slug, 'csc', 'iso'] as const,
    },
    tasks: {
      all: (slug: string) =>
        [...queryKeys.teams.detail(slug), 'tasks'] as const,
      detail: (slug: string, taskNumber: string) =>
        [...queryKeys.teams.tasks.all(slug), taskNumber] as const,
      comments: (slug: string, taskNumber: string) =>
        [
          ...queryKeys.teams.tasks.detail(slug, taskNumber),
          'comments',
        ] as const,
      attachments: (slug: string, taskNumber: string) =>
        [
          ...queryKeys.teams.tasks.detail(slug, taskNumber),
          'attachments',
        ] as const,
      csc: (slug: string, taskNumber: string) =>
        [...queryKeys.teams.tasks.detail(slug, taskNumber), 'csc'] as const,
    },
    apiKeys: (slug: string) =>
      [...queryKeys.teams.detail(slug), 'api-keys'] as const,
  },
  oscrat: {
    organization: {
      summary: (teamId: string) =>
        ['teams', teamId, 'oscrat', 'organization', 'summary'] as const,
      detail: (teamId: string) =>
        ['teams', teamId, 'oscrat', 'organization', 'detail'] as const,
    },
    projects: {
      all: (teamId: string) => ['teams', teamId, 'oscrat', 'projects'] as const,
      detail: (teamId: string, projectId: string) =>
        [...queryKeys.oscrat.projects.all(teamId), projectId] as const,
      assessments: {
        all: (teamId: string, projectId: string) =>
          [
            ...queryKeys.oscrat.projects.detail(teamId, projectId),
            'assessments',
          ] as const,
        detail: (teamId: string, projectId: string, assessmentId: string) =>
          [
            ...queryKeys.oscrat.projects.assessments.all(teamId, projectId),
            assessmentId,
          ] as const,
      },
      repositories: {
        all: (teamId: string, projectId: string) =>
          [
            ...queryKeys.oscrat.projects.detail(teamId, projectId),
            'repositories',
          ] as const,
        detail: (teamId: string, projectId: string, repositoryId: string) =>
          [
            ...queryKeys.oscrat.projects.repositories.all(teamId, projectId),
            repositoryId,
          ] as const,
      },
      jobs: {
        sbom: (teamId: string, projectId: string) =>
          [
            ...queryKeys.oscrat.projects.detail(teamId, projectId),
            'jobs',
            'sbom',
          ] as const,
      },
      versions: {
        all: (teamId: string, productId: string) =>
          [
            ...queryKeys.oscrat.projects.detail(teamId, productId),
            'versions',
          ] as const,
        detail: (teamId: string, versionId: string) =>
          ['teams', teamId, 'oscrat', 'versions', versionId] as const,
        assessments: {
          all: (teamId: string, versionId: string) =>
            [
              ...queryKeys.oscrat.projects.versions.detail(teamId, versionId),
              'assessments',
            ] as const,
          detail: (teamId: string, versionId: string, assessmentId: string) =>
            [
              ...queryKeys.oscrat.projects.versions.assessments.all(
                teamId,
                versionId
              ),
              assessmentId,
            ] as const,
        },
        repositories: {
          all: (teamId: string, versionId: string) =>
            [
              ...queryKeys.oscrat.projects.versions.detail(teamId, versionId),
              'repositories',
            ] as const,
          detail: (teamId: string, versionId: string, repositoryId: string) =>
            [
              ...queryKeys.oscrat.projects.versions.repositories.all(
                teamId,
                versionId
              ),
              repositoryId,
            ] as const,
        },
        jobs: {
          sbom: (teamId: string, versionId: string) =>
            [
              ...queryKeys.oscrat.projects.versions.detail(teamId, versionId),
              'jobs',
              'sbom',
            ] as const,
        },
      },
    },
  },
  wellKnown: {
    samlCert: ['well-known', 'saml.cer'] as const,
  },
  scim: {
    v2: (directory: string[]) => ['scim', 'v2.0', ...directory] as const,
  },
} as const;
