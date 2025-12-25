FROM node:20-alpine

WORKDIR /app

# 1) залежності (окремо, щоб кешувалось)
COPY server/package*.json ./server/
RUN cd server && npm ci

# 2) код сервера + client
COPY server ./server
COPY client ./client

EXPOSE 3000

CMD ["node", "server/src/app.js"]
