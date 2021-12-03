import { IResolvers } from '@graphql-tools/utils';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { DocumentNode } from 'graphql';
import http from 'http';
import theResolvers from './resolvers';
import theTypeDefs from './type-defs';

const startApolloServer = async (
  typeDefs: DocumentNode,
  resolvers: IResolvers
): Promise<void> => {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/',
  });

  const port = process.env.PORT || 3000;
  await new Promise<void>(resolve => {
    httpServer.listen({ port }, resolve);
  });
  // eslint-disable-next-line no-console
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
};

startApolloServer(theTypeDefs, theResolvers);
