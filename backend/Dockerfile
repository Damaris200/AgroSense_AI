# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build (type-check + bundle) ──────────────────────────────────────
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Type-check, then bundle for production
RUN bun run typecheck
RUN bun build src/index.ts --outdir=dist --target=bun --minify

# ── Stage 3: Production image ──────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy what is needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./src/db/schema.sql

# Non-root user for security
RUN addgroup -S agrosense && adduser -S agrosense -G agrosense
USER agrosense

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["bun", "dist/index.js"]
