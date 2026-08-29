# ── Stage 1: Build TypeScript & Prisma Client ──
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY . .

# Install all dependencies including dev tools
RUN npm ci --ignore-scripts

# Generate Prisma client & compile TypeScript
RUN npm run build --workspace=@repo/api

# ── Stage 2: Ultra-slim Production Runner (~140 MB) ──
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/api

EXPOSE 5000

# Server runs self-healing schema sync & seeding automatically on startup
CMD ["node", "dist/server.js"]
