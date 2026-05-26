# ── Stage 1: Build Angular ────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (cached layer — only re-runs when package files change)
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source and build for production
# Uses environment.prod.ts which sets apiUrl: '/api' (relative → proxied by nginx)
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS final

# Angular 17+ with the application builder outputs to dist/<name>/browser/
COPY --from=build /app/dist/study-buddy-hub-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
