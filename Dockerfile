# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and prisma schema
COPY . .
RUN npx prisma generate

# Forzamos la creación de dist y compilamos
RUN rm -rf dist && npx tsc

# Build the project
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
