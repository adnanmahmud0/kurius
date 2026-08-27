FROM node:20-alpine

# Required for Next.js sharp and native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy monorepo files
COPY . .

# Install ALL dependencies
RUN npm ci --ignore-scripts

# ── NEXT_PUBLIC_* vars must be available at BUILD TIME ──
# They are passed as --build-arg from docker-compose.prod.yml
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Increase memory limit for Next.js build on low-RAM servers
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Build the web app
RUN npm run build --workspace=@repo/web

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app/apps/web

CMD ["node", "../../node_modules/.bin/next", "start", "-p", "3000"]
