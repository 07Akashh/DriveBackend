# Use Node.js 20 LTS (Alpine for smaller image size)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Copy Firebase admin SDK file
COPY my-project-firebase-adminsdk.json ./

# Create uploads directory
RUN mkdir -p uploads

# Expose the port your app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]
