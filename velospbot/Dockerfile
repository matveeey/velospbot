FROM node:22
WORKDIR /velospbot
COPY package*.json ./
RUN npm install && \
    npm install @twa-dev/sdk leaflet react-leaflet && \
    npm install -D @types/leaflet
COPY . .