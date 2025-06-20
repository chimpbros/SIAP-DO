# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# The build context starts in the 'frontend' directory due to Coolify's Base Directory setting.
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend application code from the current directory (build context)
COPY . .

# Set the API URL environment variable for the build process
# Coolify will need to inject this ARG or ENV at build time if it's different from default
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

# Build the React app
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:1.25-alpine

# Set the API URL environment variable for the serving stage
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

# Copy the build output from the build stage to Nginx's web server directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration file (optional, but good for SPA routing)
# The build context starts in the 'frontend' directory.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
