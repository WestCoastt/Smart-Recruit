# Base image
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build client
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --production
RUN npm install --workspace=server --production

# Copy built client and server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start"] 