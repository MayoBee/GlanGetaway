# ========================================================================
# Hotel Booking Backend - Dockerfile
# ========================================================================
# Multi-stage Dockerfile for Render deployment - Build TypeScript to JS
# Build context: hotel-booking-backend directory
# ========================================================================

# Stage 1: Builder - Build TypeScript to JavaScript
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Create shared directory if needed
RUN mkdir -p shared

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production - Run compiled JavaScript
FROM node:20-alpine AS runner
WORKDIR /app

# Install openssl for secure connections
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Copy uploads directory
COPY --from=builder /app/uploads ./uploads

# Create shared directory for runtime
RUN mkdir -p shared

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=256"

# Expose port 5000 (Render's expected port)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the compiled JavaScript application
CMD ["node", "dist/src/index.js"]
