# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/

# Install backend dependencies
RUN cd backend && npm ci

# Copy backend source
COPY backend/src ./backend/src

# Build TypeScript
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/backend/dist ./dist

# Expose port (Railway will override with PORT env var)
EXPOSE 3001

# Start the app
CMD ["node", "dist/index.js"]
