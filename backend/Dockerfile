FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install 

# Copy source code
COPY . .

EXPOSE 4000
CMD ["node", "server.js"]
