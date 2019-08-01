import express from 'express';
import {ApolloServer, gql} from 'apollo-server-express';

const app = express();

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
	Query: {
		hello: () => 'Do Eat, Record Api!',
	},
};

const server = new ApolloServer({typeDefs, resolvers});

server.applyMiddleware({app, path: '/graphql'});

app.listen({port: 4000}, () => {
	console.log('Apollo Server on http://localhost:4000/graphql')
});