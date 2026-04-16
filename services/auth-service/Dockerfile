FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Run migrations then start (entrypoint handles both)
EXPOSE 4001
CMD ["bun", "run", "start:docker"]
