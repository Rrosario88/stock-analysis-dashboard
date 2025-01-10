# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including esbuild
RUN npm install --legacy-peer-deps && npm install -g esbuild

# Copy source code
COPY . .

# Create dist directory
RUN mkdir -p dist/client

# Build client
WORKDIR /app/client
RUN npm install --legacy-peer-deps
ENV VITE_OUT_DIR=../dist/client
RUN npm run build

# Build production server
WORKDIR /app
RUN esbuild server/production.ts \
    --platform=node \
    --bundle \
    --format=cjs \
    --outfile=dist/index.cjs \
    --external:vite \
    --external:@vitejs/plugin-react \
    --external:@replit/vite-plugin-runtime-error-modal \
    --external:@replit/vite-plugin-shadcn-theme-json

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy client build output
COPY --from=builder /app/dist/client ./dist/client

# Copy server build output
COPY --from=builder /app/dist/index.cjs ./dist/index.cjs
COPY --from=builder /app/server ./server

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.cjs"]
