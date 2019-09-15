import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import typeDefs from './schema';
import resolvers from './resolvers';
import './db.config'

const app = express();
const server = new ApolloServer({typeDefs, resolvers});

server.applyMiddleware({app, path: '/graphql'});

app.listen({port: 4000}, () => {
	console.log('Apollo Server on http://api.doeatrecord.com:4000/graphql')
});