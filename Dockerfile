# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS tooling

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    git \
    python3 \
    python3-pip \
    python3-venv \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && corepack prepare pnpm@9.15.4 --activate

RUN curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
RUN curl -sSfL https://raw.githubusercontent.com/anchore/grype/v0.116.0/install.sh | sh -s -- -b /usr/local/bin v0.116.0
RUN python3 -m venv /opt/openscap-venv \
  && /opt/openscap-venv/bin/pip install --no-cache-dir openscap-report==1.0.0 \
  && ln -sf /opt/openscap-venv/bin/oscap-report /usr/local/bin/oscap-report

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    git \
    python3 \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/jobrunner/package.json apps/jobrunner/package.json
COPY packages/model/package.json packages/model/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .

ENV DATABASE_URL=postgresql://postgres:counter@db:5432/unicis_platform
ENV APP_URL=http://localhost:4002
ENV NEXT_PUBLIC_APP_URL=http://localhost:4002
ENV NEXTAUTH_URL=http://localhost:4002
ENV NEXTAUTH_SECRET=docker-development-secret
ENV TOKEN_ENCRYPTION_KEY=docker-development-token-key
ENV CONFIRM_EMAIL=false
ENV NODE_ENV=production

RUN pnpm --filter @oscrat/model exec prisma generate
RUN pnpm --filter @oscrat/frontend build
RUN generated_client_dir="$(find /app/node_modules -path '*/node_modules/.prisma/client' -type d -print -quit)" \
  && test -n "$generated_client_dir" \
  && mkdir -p /tmp/prisma-engines \
  && cp "$generated_client_dir"/libquery_engine-*.so.node /tmp/prisma-engines/
RUN pnpm --filter @oscrat/jobrunner build
RUN pnpm --filter @oscrat/jobrunner --prod deploy /opt/jobrunner \
  && generated_client_dir="$(find /app/node_modules -path '*/node_modules/.prisma/client' -type d -print -quit)" \
  && test -n "$generated_client_dir" \
  && find /opt/jobrunner/node_modules -path '*/node_modules/@prisma/client' -type d -exec sh -c 'prisma_node_modules_dir="$(dirname "$(dirname "$1")")"; mkdir -p "$prisma_node_modules_dir/.prisma"; cp -a "$2" "$prisma_node_modules_dir/.prisma/client"' sh {} "$generated_client_dir" \;

FROM node:22-bookworm-slim AS jobrunner-runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    openssl \
    python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=tooling /usr/local/bin/syft /usr/local/bin/syft
COPY --from=tooling /usr/local/bin/grype /usr/local/bin/grype
COPY --from=tooling /opt/openscap-venv /opt/openscap-venv
COPY --from=build /opt/jobrunner ./
RUN ln -sf /opt/openscap-venv/bin/oscap-report /usr/local/bin/oscap-report

ENV NODE_ENV=production

FROM node:22-bookworm-slim AS frontend

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/apps/frontend/public ./public
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /tmp/prisma-engines ./apps/frontend/.next/server

ENV NODE_ENV=production
ENV PORT=4002
ENV HOSTNAME=0.0.0.0

EXPOSE 4002
CMD ["node", "apps/frontend/server.js"]

FROM jobrunner-runtime AS jobrunner

EXPOSE 3001
CMD ["./node_modules/.bin/tsx", "dist/apps/jobrunner/src/index.js"]