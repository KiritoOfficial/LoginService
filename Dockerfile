FROM node:18-alpine

WORKDIR /app

COPY db ./db
COPY yarn*.lock ./
COPY package*.json ./

RUN npm install

COPY . .

RUN npx drizzle-kit push

EXPOSE 3000

CMD ["npm", "run", "start"]