# ── Stage 1: Build Next.js standalone bundle ──
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy entire monorepo
COPY . .

# Ensure public directory exists
RUN mkdir -p /app/apps/web/public

# Install all dependencies
RUN npm ci --ignore-scripts

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build web standalone bundle
RUN npm run build --workspace=@repo/web

# ── Stage 2: Ultra-slim Runner (~120 MB) ──
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone monorepo output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

# Run monorepo standalone server entrypoint
CMD ["node", "apps/web/server.js"]
