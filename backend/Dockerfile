# ---- Build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# openssl is needed by Prisma's query engine on Alpine
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

RUN npx prisma generate
RUN npm run build

# ---- Runtime stage ----
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 8000
CMD ["node", "dist/main"]