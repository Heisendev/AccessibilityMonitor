# Stage 1: Build frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production image
FROM node:22-slim AS production

WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --omit=dev

# Install Playwright's Chromium and its system dependencies
RUN npx playwright install --with-deps chromium

COPY backend/ ./

# Copy built frontend into backend to be served statically
COPY --from=frontend-builder /app/frontend/dist ./public

# Data volume for SQLite
VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "src/index.js"]
