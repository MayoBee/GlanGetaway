# ========================================================================
# Hotel Booking Backend - Dockerfile
# ========================================================================
# Optimized Dockerfile for Render deployment
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

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=512"

# Expose port 5000 (Render's expected port)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application with ts-node and memory limit
CMD ["sh", "-c", "NODE_OPTIONS='--max-old-space-size=512' npx ts-node src/index.ts"]
