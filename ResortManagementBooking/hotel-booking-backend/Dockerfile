# ========================================================================
# Hotel Booking Backend - Dockerfile
# ========================================================================
# Simple Dockerfile for Render deployment - Run directly with ts-node
# Build context: hotel-booking-backend directory
# ========================================================================

# Use Node.js runtime directly
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install openssl for secure connections
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for ts-node)
RUN npm ci

# Copy source code
COPY . .

# Create shared directory if needed
RUN mkdir -p shared

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=512"

# Expose port 5000 (Render's expected port)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application directly with ts-node (no build step)
CMD ["npx", "ts-node", "src/index.ts"]
