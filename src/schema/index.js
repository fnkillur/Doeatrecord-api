import {gql} from "apollo-server-express";

export default gql`
  scalar Date
  
  type Query {
    records(userId: String!, pageNo: Int! = 1) : [Record]
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
	  visitedDate: Date
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
    visitedDate: Date
    menus: [String]
    money: Int
  }
`;