# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Copy package config
COPY package*.json ./

# Install dependencies (using npm install as fallback in case package-lock is missing, but npm ci is preferred if present)
RUN npm ci || npm install

# Copy source code
COPY . .

# Accept build arguments from Railway
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build Vite project
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Target the custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
