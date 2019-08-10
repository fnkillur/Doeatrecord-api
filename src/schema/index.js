import {gql} from 'apollo-server-express';

export default gql`
	type Query {
		hello: String
	}
	
	type User {
		id: String
		places: [Place]
		SpendList: [Spend]
	}
	
	type Place {
		id: String
		x: String
		y: String
		category: String
	}
	
	type Spend {
		id: ID
		userId: String
		palceId: String
		money: Int
	}
`;