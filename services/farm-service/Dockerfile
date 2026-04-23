FROM oven/bun:1

WORKDIR /app

# 1. Copy dependency files first
COPY package.json bun.lock* ./
COPY prisma ./prisma
# 2. Install dependencies
RUN bun install

# 3. Copy EVERYTHING (including prisma folder)
COPY . .

# 4. Generate Prisma client AFTER full source exists
RUN bunx prisma generate

EXPOSE 4002

CMD ["bun", "run", "start"]