# Use an official Node.js runtime as a parent image
# Using Node.js 18-alpine for a smaller image size
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Using npm install --omit=dev as an alternative if npm ci causes issues.
# This will install dependencies based on package.json and use package-lock.json if available.
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on.
# Make sure your app in index.js listens on this port, preferably via process.env.PORT
# The default in frontend/src/services/api.js was 5000.
EXPOSE 5000

# Define the command to run your app
# This assumes your entry point is index.js
CMD [ "node", "index.js" ]
