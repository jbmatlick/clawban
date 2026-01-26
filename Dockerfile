# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared contracts (needed by backend imports)
COPY contracts/ ./contracts/

# Copy backend files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Install ALL dependencies (including dev deps for TypeScript compilation)
WORKDIR /app/backend
RUN npm ci

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built JavaScript files from builder
COPY --from=builder /app/backend/dist ./dist

# Expose port (Railway provides $PORT at runtime)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start the app
CMD ["node", "dist/index.js"]
