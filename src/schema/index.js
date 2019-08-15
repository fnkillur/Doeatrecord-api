import {gql} from "apollo-server-express";

export default gql`
  scalar Date
  
  type Query {
    getMyRecords(userId: String!) : [Record]
  }

  type Mutation {
    createRecord(input: NewRecord!) : Record
  }
  
  type Record {
    userId: String!
    placeId: String!
    category: String
    x: String
    y: String
    money: Int
    menus: [String]
    created: Date
    updated: Date
    isDelete: Boolean
  }

  input NewRecord {
    userId: String!
    placeId: String!
    category: String
    x: String
    y: String
    money: Int
    menus: [String]
  }
`;