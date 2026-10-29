# OSCRAT Platform (free and open source)

OSCRAT Platform - an open core, enterprise-ready trust management platform for startups and SMEs.

Please star the repo if you want us to continue developing and improving the OSCRAT Platform.

## Structure

```
oscrat-oves/
├── apps/
│   ├── frontend/       # @oscrat/frontend (Next.js app)
│   └── jobrunner/      # @oscrat/jobrunner (background jobs)
├── packages/
│   └── model/          # @oscrat/model (Prisma schema, DB operations, types)
├── docker-compose.yml  # Local development services
└── package.json        # Workspace orchestrator
```

## Built With

- [SaaS-Starter-Kit](https://github.com/boxyhq/saas-starter-kit/)
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com) and [Atlaskit](https://atlaskit.atlassian.com/)
- [Postgres](https://www.postgresql.org)
- [React](https://reactjs.org)
- [Prisma](https://www.prisma.io)
- [TypeScript](https://www.typescriptlang.org)
- [SAML Jackson](https://github.com/boxyhq/jackson) (Provides SAML SSO, Directory Sync)
- [Svix](https://www.svix.com/) (Provides Webhook Orchestration)
- Endpoints collection (Provided by [Osquery](https://osquery.io/))

## Deployment

Node.js is pinned to **22.23.4**, the fixed 22.x release in the
[October 2026 security bulletin](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
Deployment uses Docker. `.nvmrc` is the version source for local development and
GitHub Actions. Keep the `NODE_VERSION` default in all three Dockerfiles
synchronized with it. `@types/node` supplies TypeScript declarations and does not
select or update the runtime.

- `Dockerfile.frontend` builds the Next.js frontend and backend API as a standalone
  server on port 4002. `Dockerfile.jobrunner` builds the separate database-polling
  worker with Syft, Grype, and openscap-report. `Dockerfile.txt` offers both as
  separate `frontend` and `jobrunner` targets. Every Node stage keeps the existing
  Debian Bookworm slim base and pins the full Node.js version.
- GitHub Actions runs generation, lint, typecheck, and build on pushes/PRs to
  `main`; it does not deploy. Docker Compose only starts local PostgreSQL.

To roll out the runtime update, rebuild both Docker images with `--pull`, then
replace the running instances. For example, from the repository root:

```bash
docker build --pull -f Dockerfile.frontend -t oscrat-frontend:node-22.23.4 .
docker build --pull -f Dockerfile.jobrunner -t oscrat-jobrunner:node-22.23.4 .
```

Verify `node --version` inside each new running container, check frontend
`/api/health` against its database, and confirm the worker connects and polls its
queue. Repository pins alone do not establish the Node.js version of an already
running service.

### Matomo analytics

Production frontend builds track page views, Next.js route changes, and outlinks
using the existing `@socialgouv/matomo-next` integration. Both frontend Docker build
paths default to `https://stats.unicis.tech/matomo` with Site ID `11`. Tracking is
disabled in development and when either Matomo setting is empty.

Override `NEXT_PUBLIC_MATOMO_URL` and `NEXT_PUBLIC_MATOMO_SITE_ID` with Docker
`--build-arg` options when building a different environment. Set both build
arguments to empty values to disable tracking. These public values and the
matching CSP allowlist are embedded at build time. Set new build arguments and
rebuild the frontend image to change them; runtime environment variables alone
have no effect.

## Getting Started

Please follow these simple steps to get a local copy up and running.

### Prerequisites

- Node.js 22.23.4 (see `.nvmrc`; run `nvm install && nvm use`)
- PostgreSQL
- PNPM
- Docker compose
- [Syft](https://github.com/anchore/syft) (required by the jobrunner for SBOM generation)
- [Grype](https://github.com/anchore/grype) (required by the jobrunner for vulnerability scanning)
- [openscap-report](https://github.com/OpenSCAP/openscap-report) (required by the jobrunner for configuration scan reports)

### Development

#### 1. Setup

- [Fork](https://github.com/oscrat/OSCRAT/fork) the repository
- Clone the repository by using this command:

```bash
git clone https://github.com/oscrat/OSCRAT.git
```

#### 2. Go to the project folder

```bash
cd oscrat-oves
```

#### 3. Install dependencies

```bash
pnpm install
```

#### 4. Install Syft, Grype & openscap-report

The jobrunner shells out to these binaries — install them and make sure they're on your `PATH`. See [syft](https://github.com/anchore/syft#installation), [grype](https://github.com/anchore/grype#installation), and [openscap-report](https://github.com/OpenSCAP/openscap-report#installation).

#### 5. Set up your .env file

Duplicate the root `.env.example` to `.env`:

```bash
cp .env.example .env
```

Keep `CONFIRM_EMAIL=false` in your local `.env`. No SMTP is wired up by default, so if email confirmation is on, new accounts will be stuck waiting for a confirmation email that never arrives.

#### 6. Start local services (Database)

```bash
pnpm services:db:up
```

This starts a PostgreSQL container for local development.

#### 7. Set up database schema

```bash
pnpm db:generate
pnpm db:migrate:dev
```

On a fresh database this applies every migration in `packages/model/prisma/migrations/` in order and generates the Prisma client.

#### 8. Start the development server

```bash
pnpm dev
```

This starts both the frontend and the jobrunner.

#### 9. Start the Prisma Studio

Prisma Studio is a visual editor for the data in your database.

```bash
pnpm db:studio
```

### Available Scripts

#### Root Level

- `pnpm dev` - Start all apps in development
- `pnpm build` - Build all apps
- `pnpm typecheck` - Type check all packages
- `pnpm services:db:up` - Start local PostgreSQL
- `pnpm services:db:down` - Stop local PostgreSQL
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate:dev` - Apply migrations locally
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:reset` - Reset the local database

## Features

- Create account
- Sign in with Email and Password
- Sign in with Magic Link
- Sign in with SAML SSO
- Sign in with Google [[Setting up Google OAuth](https://support.google.com/cloud/answer/6158849?hl=en)]
- Sign in with GitHub [[Creating a Github OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)]
- Directory Sync (SCIM)
- Update account
- Create team
- Invite users to the team
- Manage team members
- Update team settings
- Webhooks & Events
- Internationalization
- Audit logs
- Roles and Permissions
- Dark mode

## License

Apache 2.0 — see [LICENSE](./LICENSE).
