FROM node:20-alpine

WORKDIR /tg-bot

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"] 