import { IResolvers } from '@graphql-tools/utils';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { DocumentNode } from 'graphql';
import http from 'http';
import express from './express/express';
import theResolvers from './graphql/resolvers';
import theTypeDefs from './graphql/type-defs';

const startApolloServer = async (
  app: Express,
  typeDefs: DocumentNode,
  resolvers: IResolvers
): Promise<void> => {
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/api/auth-server/v1/graphql',
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

startApolloServer(express, theTypeDefs, theResolvers);
