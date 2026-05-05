FROM oven/bun:1 AS base
WORKDIR /app
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache

# Install dependencies first (layer cache)
COPY package.json bun.lock* ./
RUN rm -rf /root/.bun/install/cache && mkdir -p /tmp/bun-cache
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Run migrations then start (entrypoint handles both)
EXPOSE 4001
CMD ["bun", "run", "start:docker"]
