# Single-stage build for simplicity and debugging
FROM node:20-alpine

WORKDIR /app

# Copy everything needed
COPY contracts/ ./contracts/
COPY backend/ ./backend/

# Build backend
WORKDIR /app/backend

# Install dependencies
RUN npm ci

# Build TypeScript - show output for debugging
RUN echo "=== Building TypeScript ===" && \
    npm run build && \
    echo "=== Build complete ===" && \
    ls -la && \
    echo "=== Checking dist/ ===" && \
    ls -la dist/ || echo "ERROR: dist/ not found!"

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start app (TypeScript outputs to dist/backend/src/ due to include paths)
CMD ["node", "dist/backend/src/index.js"]
