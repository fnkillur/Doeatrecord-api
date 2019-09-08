import {gql} from "apollo-server-express";

export default gql`
  scalar Date
  
  type Query {
    records(userId: String!) : [Record]
  }

  type Mutation {
    createRecord(input: NewRecord!) : Record
  }
  
  type Record {
	  _id: ID
    userId: String!
    placeId: String!
	  placeName: String
    category: String
    address: String
    x: String
    y: String
	  visitedDate: String
    menus: [String]
    money: Int
    created: Date
    updated: Date
    isDelete: Boolean
  }

  input NewRecord {
    userId: String!
    placeId: String!
	  placeName: String
    category: String
    address: String
    x: String
    y: String
    visitedDate: String
    menus: [String]
    money: Int
  }
`;