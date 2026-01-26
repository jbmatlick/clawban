# Single-stage build for simplicity and debugging
FROM node:20-alpine

WORKDIR /app

# Copy everything needed
COPY contracts/ ./contracts/
COPY backend/ ./backend/

# Build backend
WORKDIR /app/backend
RUN npm ci
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start app
CMD ["node", "dist/index.js"]
