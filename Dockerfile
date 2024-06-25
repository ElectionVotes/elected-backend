# elected-backend/Dockerfile
FROM node:16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./

# Rebuild native modules
RUN npm rebuild bcrypt --build-from-source

EXPOSE 5000

CMD ["node", "index.js"]
