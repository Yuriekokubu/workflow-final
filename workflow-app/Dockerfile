FROM node:alpine

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the Angular app source code
COPY . .

# Expose port 4200 for Angular development server
EXPOSE 4200

# Start Angular using the local version of CLI
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
