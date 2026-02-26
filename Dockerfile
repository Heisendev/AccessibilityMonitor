# Stage 1: Build frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production image
FROM node:22-slim AS production

# Install Chromium dependencies for Cypress
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV CYPRESS_INSTALL_BINARY=0
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --omit=dev
COPY backend/ ./

# Copy built frontend into backend to be served statically
COPY --from=frontend-builder /app/frontend/dist ./public

# Data volume for SQLite
VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "src/index.js"]
