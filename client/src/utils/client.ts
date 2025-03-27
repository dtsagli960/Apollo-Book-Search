// src/client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.SERVER_GRAPHQL_BASE_URL,
  cache: new InMemoryCache(),
});

export default client;
