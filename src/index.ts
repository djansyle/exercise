import { fileLoader, mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import { ApolloServer, ApolloError } from 'apollo-server-express';
import express from 'express';
import path from 'path';
import http, { Server } from 'http';

import * as database from './library/database';
import { race, delay } from 'bluebird';
import ms from 'ms';

const app = express();
let httpServer: Server;
let exiting = false;

const server = new ApolloServer({
  typeDefs: mergeTypes(
    fileLoader(path.join(__dirname, '../type'), { recursive: true }),
    { all: true },
  ),
  resolvers: mergeResolvers(
    fileLoader(path.join(__dirname, './resolver'), { recursive: true }),
  ),
  formatError: err => {
    // no need to log user error
    if (!(err instanceof ApolloError)) {
      console.log(err);
    }

    if (process.env.NODE_ENV === 'production') {
      delete err.stack;
    }

    return err;
  },
});

async function start() {
  await database.initialize();

  const httpPort = parseInt(process.env.HTTP_PORT || '80', 10);
  server.applyMiddleware({ app });
  httpServer = http.createServer(app);
  httpServer.listen(httpPort);

  console.log(`🚀 Application started at port ${httpPort}.`);
}

export async function stop() {
  await new Promise(resolve => httpServer.close(() => resolve()));
  await server.stop();
  await database.flush();
}

async function gracefulShutdown() {
  if (exiting) {
    return;
  }

  exiting = true;

  try {
    await race([
      stop(),
      (async function() {
        await delay(ms('10s'));
        throw new Error('Failed to shutdown gracefully.');
      })(),
    ]);
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }

  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default start();
