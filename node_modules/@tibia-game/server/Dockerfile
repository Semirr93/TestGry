# Use Node.js 20 slim as base image
FROM node:20-slim as builder

# Set working directory
WORKDIR /app

# Copy root package.json and package-lock.json first for better caching
COPY package*.json ./

# Copy shared folder BEFORE build (needed for TypeScript compilation)
COPY shared/ ./shared/

# Copy server package.json and package-lock.json
COPY apps/server/package*.json ./apps/server/

# Copy server source code
COPY apps/server/ ./apps/server/

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Build TypeScript
WORKDIR /app/apps/server
RUN npm run build

# Production stage
FROM node:20-slim as production

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Copy shared folder (needed for runtime)
COPY shared/ ./shared/

# Expose port 3001
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["node", "dist/apps/server/src/index.js"]
