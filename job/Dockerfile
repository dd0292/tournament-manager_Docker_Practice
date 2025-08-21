# ALL Chaty
FROM node:18-alpine
WORKDIR /app

# Copy only package files first (better cache)
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Default command
CMD ["npm", "start"]
