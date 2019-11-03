FROM node:12.8.0-alpine

WORKDIR /srv/node

COPY ./build /srv/node/build
COPY ./package.json /srv/node/package.json
COPY ./package-lock.json /srv/node/package-lock.json
COPY ./type /srv/node/type

RUN npm install --production && npm cache clean --force

EXPOSE 80

CMD npm start
