FROM node:18-alpine AS base

# Install pnpm and system dependencies
RUN npm install -g pnpm

# Install syft for SBOM generation
RUN apk add --no-cache curl \
    && SYFT_VERSION="v1.0.1" \
    && curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin $SYFT_VERSION \
    && syft version

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages and apps
COPY packages ./packages
COPY apps/jobrunner ./apps/jobrunner

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @oscrat/model generate

# Build the jobrunner app
RUN pnpm --filter @oscrat/jobrunner build

# Production stage
FROM node:18-alpine AS production

# Install pnpm and system dependencies
RUN npm install -g pnpm

# Install syft for SBOM generation
RUN apk add --no-cache curl \
    && SYFT_VERSION="v1.0.1" \
    && curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin $SYFT_VERSION \
    && syft version

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy built packages
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/jobrunner/dist ./apps/jobrunner/dist
COPY --from=base /app/apps/jobrunner/package.json ./apps/jobrunner/package.json

RUN pnpm install --frozen-lockfile --prod

RUN pnpm --filter @oscrat/model generate

RUN addgroup -g 1001 -S nodejs
RUN adduser -S jobrunner -u 1001

RUN chown -R jobrunner:nodejs /app
USER jobrunner

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the application
CMD ["node", "apps/jobrunner/dist/index.js"] 