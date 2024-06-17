# elected-backend/server/Dockerfile
FROM node:14

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
EXPOSE 5000

CMD ["node", "src/index.js"]
