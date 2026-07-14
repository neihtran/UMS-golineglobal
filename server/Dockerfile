# server/Dockerfile
# Multi-stage production build for UMS Backend

# ─── Stage 1: Build ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ─── Stage 2: Production Runtime ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Security: create non-root user
RUN addgroup -g 1001 -S ums && \
    adduser -S ums -u 1001 -G ums

ENV NODE_ENV=production
ENV PORT=5000

# Copy built artifacts
COPY --from=builder --chown=ums:ums /app/dist ./dist
COPY --from=builder --chown=ums:ums /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R ums:ums /app/uploads

USER ums
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
