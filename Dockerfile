# syntax=docker/dockerfile:1.4
FROM node:alpine as base

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app
COPY --link ./package*.json ./

RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

COPY --from=deps --link /app/node_modules ./node_modules
COPY --link . .

RUN npm run build

FROM base AS runner

WORKDIR /app

COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=builder --link /app/dist ./dist
COPY --link package.json ./

CMD ["npm", "run", "start"]


