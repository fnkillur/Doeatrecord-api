import {gql} from 'apollo-server-express';

export default gql`
	type Query {
		hello: String
	}
	
	type User {
		id: String
		key: String
		email: String
		phone: String
	}
`;