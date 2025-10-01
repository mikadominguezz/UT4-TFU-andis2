# Use the official Node.js image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY src/productAPI/package*.json ./

# Install dependencies
RUN npm install

# Copy proto files
COPY proto /app/proto

# Copy the rest of the application code
COPY src/productAPI .

# Expose the port the app runs on
EXPOSE 3003

# Start the application
CMD ["node", "server.js"]