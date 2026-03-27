# ========================================================================
# Hotel Booking Backend - Dockerfile
# ========================================================================
# Simplified Dockerfile for Render deployment - Skip TypeScript build
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

# Install dependencies
RUN npm ci --only=production

# Copy source code directly (no TypeScript build)
COPY . .

# Create shared directory if needed
RUN mkdir -p shared

# Install ts-node to run TypeScript directly
RUN npm install --save-dev ts-node

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application directly with ts-node
CMD ["npx", "ts-node", "src/index.ts"]
