# Use Node.js 20 LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p uploads

# Expose the port your app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]
