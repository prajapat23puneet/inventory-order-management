# frontend/Dockerfile
# Multi-stage build:
#   Stage 1 (build):  node:20-alpine  — installs deps, runs `npm run build`
#   Stage 2 (serve):  nginx:alpine    — serves the static dist/ folder

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Clean install — respects package-lock.json
RUN npm ci

# Copy all source files (node_modules and dist excluded via .dockerignore)
COPY . .

# Build-time env var injected via docker-compose build args
# Vite bakes this into the bundle at build time, not at runtime
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace the default nginx config with our SPA-aware config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
