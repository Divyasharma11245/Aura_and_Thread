FROM node:22-alpine

WORKDIR /app

COPY backend/package.json ./package.json
RUN npm install --omit=dev

COPY backend ./backend
COPY auth-service ./auth-service

WORKDIR /app/backend
EXPOSE 5001
CMD ["node", "server.js"]
