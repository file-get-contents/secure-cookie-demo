FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY app.js ./

EXPOSE 3000

CMD ["node", "app.js"]
