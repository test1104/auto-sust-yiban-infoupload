FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

RUN npm run build

COPY . .

EXPOSE 47357

CMD [ "npm", "start" ]
