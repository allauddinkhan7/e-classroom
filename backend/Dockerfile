# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


# ============================================================
# Stage 2: Build
# ============================================================
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build


# ============================================================
# Stage 3: Production
# ============================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled NestJS application
COPY --from=builder /app/dist ./dist

# Prisma Client + Prisma runtime files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma schema/migrations
COPY --from=builder /app/prisma ./prisma

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]