import { fileLoader, mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import http, { Server } from 'http';

import * as database from './library/database';
import { race, delay } from 'bluebird';
import ms from 'ms';

const app = express();
let httpServer: Server;

const server = new ApolloServer({
  typeDefs: mergeTypes(
    fileLoader(path.join(__dirname, '../type'), { recursive: true }),
    { all: true },
  ),
  resolvers: mergeResolvers(
    fileLoader(path.join(__dirname, './resolver'), { recursive: true }),
  ),
});

async function start() {
  await database.initialize();

  const httpPort = parseInt(process.env.HTTP_PORT || '80', 10);
  server.applyMiddleware({ app });
  httpServer = http.createServer(app);
  httpServer.listen(httpPort);

  console.log(`🚀 Application started at port ${httpPort}.`);
}

async function stop() {
  await new Promise(resolve => httpServer.close(() => resolve()));
  await server.stop();
  return new Promise((resolve, reject) => {
    database.db.saveDatabase(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function gracefulShutdown() {
  try {
    await race([
      stop(),
      async function() {
        await delay(ms('10s'));
        throw new Error('Failed to shutdown gracefully.');
      },
    ]);
  } catch (e) {
    console.log(e);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

start();
