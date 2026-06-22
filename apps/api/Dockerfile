# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npx nest build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S koli && adduser -S koli -G koli

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER koli
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "dist/main.js"]
