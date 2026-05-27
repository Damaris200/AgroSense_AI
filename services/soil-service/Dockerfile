FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Self-heal schema (Prisma 7 IDE extension keeps stripping `url`; Prisma 6 needs it)
# and generate the client.
RUN grep -q 'env("DATABASE_URL")' prisma/schema.prisma \
      || sed -i '/^\s*provider\s*=/a\  url      = env("DATABASE_URL")' prisma/schema.prisma \
    && bunx prisma generate

EXPOSE 3004
CMD ["bun", "run", "start:docker"]
