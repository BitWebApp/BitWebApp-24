# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies like nodemon)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "dev"]

