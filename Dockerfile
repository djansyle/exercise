FROM node:12.8.0-alpine

WORKDIR /srv/node

ENV NODE_ENV=production

COPY ./build /srv/node/build
COPY ./package.json /srv/node/package.json

RUN npm install --production && npm cache clean --force

EXPOSE 80

CMD npm start
