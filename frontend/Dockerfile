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

# Public environment variables are embedded into the
# browser bundle during the Next.js build.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LIVEKIT_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL

RUN npm run build


# ============================================================
# Stage 3: Production
# ============================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./

# Static assets
COPY --from=builder /app/.next/static ./.next/static

# Public directory
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]