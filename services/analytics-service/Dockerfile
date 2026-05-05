FROM oven/bun:1
WORKDIR /app
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache
COPY package.json bun.lock* ./
RUN rm -rf /root/.bun/install/cache && mkdir -p /tmp/bun-cache
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate
CMD ["bun", "src/index.ts"]
