import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schemas/typeDefs.js';
import { resolvers } from './schemas/resolvers.js';
import { authenticateToken } from './services/auth.js'; 
import cors from 'cors';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true, 
    })
  );

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        try {
          const user = await authenticateToken(req);
          console.log("user ",user)
          return { user };
        } catch (error) {
          console.error("Authentication Error:", error);
          return { user: null };
        }
      },
    })
  );
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('../client/dist'));

app.get('*', (_req, res) => {
  res.sendFile('../client/dist/index.html');
});

db.once('open', async () => {
  await startServer();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL API ready at http://localhost:${PORT}/graphql`);
  });
});
