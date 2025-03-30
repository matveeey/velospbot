FROM node:22
WORKDIR /velospbot
COPY package*.json ./
RUN npm install
RUN npm install @twa-dev/sdk
COPY . .