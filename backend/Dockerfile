# Use official lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package dependency manifests
COPY package*.json ./

# Install production and development dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the application in development/production mode
CMD ["npm", "run", "dev"]