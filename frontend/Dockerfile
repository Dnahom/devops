# Use Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Install serve for serving static files
RUN npm install -g serve

# Expose frontend port
EXPOSE 3000

# Start the frontend server
#CMD ["serve", "-s", "build"]
CMD ["serve", "-s", "dist", "-l", "3002"]

