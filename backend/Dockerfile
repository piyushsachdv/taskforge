FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN addgroup -S app && adduser -S -G app app
USER app

EXPOSE 5000

CMD ["npm", "run", "dev"]
