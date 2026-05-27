FROM oven/bun:1 AS base
WORKDIR /app
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Self-heal schema: strip stale Prisma 7 LSP comments, ensure `url` is present,
# then generate the client.
RUN sed -i \
        -e '/Connection URLs are no longer supported/d' \
        -e '/Move connection URLs to prisma.config.ts/d' \
        -e '/pris\.ly\/d\/config-datasource/d' \
        prisma/schema.prisma \
    && (grep -q 'env("DATABASE_URL")' prisma/schema.prisma \
        || sed -i '/^\s*provider\s*=/a\  url      = env("DATABASE_URL")' prisma/schema.prisma) \
    && bunx prisma generate

EXPOSE 4006
CMD ["bun", "run", "start:docker"]
