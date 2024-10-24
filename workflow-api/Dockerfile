# Stage 1: Build the application
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# Copy the package.json and install dependencies (including dev dependencies)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Run the application in production
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only the production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built app from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY .env .env

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]
