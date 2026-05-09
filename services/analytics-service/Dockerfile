FROM oven/bun:1 AS base
WORKDIR /app
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

EXPOSE 4007
CMD ["bun", "run", "start:docker"]
