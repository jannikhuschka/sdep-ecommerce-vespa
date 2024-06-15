# Use the official Node.js image as a base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
# RUN cd client && npm install && npm run build

# Expose the port the server runs on
EXPOSE 5001

# Start the server
CMD ["node", "server/app.js"]
