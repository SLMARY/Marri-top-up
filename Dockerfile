# Production Dockerfile for Google Cloud Run
# Stage 1: Build the React client assets and server bundle
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies required for the build
RUN npm install

# Copy application source code
COPY . .

# Run production build (vite client build + esbuild server bundle)
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Google Cloud Run injects PORT at runtime (defaulting to 3000 or 8080)
ENV PORT=3000

# Copy dependency manifests and install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend and server artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/assets ./src/assets

# Expose port (documented port; Cloud Run maps this dynamically)
EXPOSE 3000

# Start the compiled production server
CMD ["node", "server.js"]
