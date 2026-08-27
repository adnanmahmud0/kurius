FROM node:20-alpine

# Required for some native binaries (bcrypt, etc.)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install ALL dependencies (including dev — needed for tsx, prisma CLI, typescript)
RUN npm ci --ignore-scripts

# Generate Prisma client & compile TypeScript
RUN npm run build --workspace=@repo/api

# Set production environment
ENV NODE_ENV=production

EXPOSE 5000

# Working dir must be apps/api so prisma.config.ts and schema are found correctly
WORKDIR /app/apps/api

# Start: migrate DB → start server
# Seed is handled separately by GitHub Actions after containers are up
CMD ["sh", "-c", "node /app/node_modules/.bin/prisma migrate deploy && node dist/server.js"]
