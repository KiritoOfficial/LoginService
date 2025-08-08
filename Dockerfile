FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY db ./db
COPY yarn*.lock ./
COPY package*.json ./

RUN npm install

COPY . .

RUN npx drizzle-kit push

EXPOSE 3000

CMD ["npm", "run", "start"]