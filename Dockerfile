# Use a slim Node.js base image to reduce size
FROM node:20-slim

# Create and set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy the rest of the application code
COPY . .

ENV APPLICATION_PORT=2437

# Expose the port your app listens on
EXPOSE 2437

# Define the command to start your app
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
