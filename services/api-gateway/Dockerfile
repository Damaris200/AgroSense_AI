FROM oven/bun:1 AS base
WORKDIR /app
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache

# Install dependencies (layer-cached separately from source)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000
CMD ["bun", "src/index.ts"]
