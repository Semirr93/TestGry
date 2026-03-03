# Use Node.js 20 slim as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy root package.json and package-lock.json first for better caching
COPY package*.json ./

# Copy shared folder (contains TypeScript types)
COPY shared/ ./shared/

# Copy server package.json and package-lock.json
COPY apps/server/package*.json ./apps/server/

# Install dependencies for the entire monorepo
RUN npm ci --only=production

# Copy server source code
COPY apps/server/ ./apps/server/

# Build TypeScript
WORKDIR /app/apps/server
RUN npm run build

# Expose port 3001 (not 3000 as mentioned in requirements - server runs on 3001)
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["node", "dist/index.js"]
