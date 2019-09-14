import {gql} from "apollo-server-express";

export default gql`
  scalar Date

  type Query {
    records(userId: String!, keyword: String, cursor: Int, pageSize: Int): Records!
    spending(userId: String!, now: Date): Spending!
  }

  type Mutation {
    createRecord(input: NewRecord!): Record
  }

  type Records {
    cursor: Int!
    hasMore: Boolean!
    records: [Record]!
  }

  type Record {
    _id: ID
    userId: String!
    placeId: String!
    placeName: String
    category: String
    address: String,
    url: String,
    x: String
    y: String
    visitedDate: Date
    visitedYear: Int
    visitedMonth: Int
    changedYear: Int
    changedMonth: Int
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
    address: String,
    url: String,
    x: String
    y: String
    visitedDate: Date
    visitedYear: Int
    visitedMonth: Int
    menus: [String]
    money: Int
  }

  type Spending {
    total: Int!
    dutch: Int!
  }
`;