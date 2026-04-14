FROM oven/bun
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate
EXPOSE 4001
CMD ["bun", "run", "src/index.ts"]
