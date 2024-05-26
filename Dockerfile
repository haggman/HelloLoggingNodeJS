FROM node:22-bookworm-slim

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

CMD [ "npm", "start" ]