# --- deps ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# --- build ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# --- run ---
FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# self-contained migration toolchain: prisma must be installed *locally* next to
# prisma.config.ts (the config imports "prisma/config", which a global CLI
# install cannot resolve)
WORKDIR /opt/migrate
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm init -y > /dev/null && npm install prisma@7 --no-audit --no-fund

WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["sh", "-c", "cd /opt/migrate && ./node_modules/.bin/prisma migrate deploy && cd /app && node server.js"]
