# Multi-stage build for client

# Stage 1: Build stage
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy root package.json and package-lock.json
COPY package*.json ./

# Copy shared folder (contains TypeScript types)
COPY shared/ ./shared/

# Copy client package.json and package-lock.json
COPY apps/client/package*.json ./apps/client/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy client source code
COPY apps/client/ ./apps/client/

# Build the client application
WORKDIR /app/apps/client
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:stable-alpine

# Copy built files from builder stage
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Copy nginx configuration (optional - create custom nginx config if needed)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
