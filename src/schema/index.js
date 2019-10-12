import {gql} from "apollo-server-express";

export default gql`
  scalar Date

  type Query {
    records(userId: String!, keyword: String, cursor: Int, pageSize: Int): Records!
    spending(userId: String!, now: Date): Spending!
	  users(keyword: String): [User]
    receivedAlarms(targetId: String!): [Matching]
    requestedAlarms(applicantId: String!): [Matching]
	  myLover(myId: String!): User
    countedRecords(userId: String!): [Record]
  }

  type Mutation {
    createRecord(input: NewRecord!): Record
    createUser(userId: String!, nickname: String!, thumbnail: String): Boolean
	  requestMatching(applicantId: String!, applicantName: String!, targetId: String!, targetName: String! type: String!): Boolean
    decideAlarm(_id: ID!, result: String!, type: String!, myId: String!, applicantId: String!): Boolean
    offAlarm(_id: ID!): Boolean
    deleteRecord(_id: ID!): Boolean
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
    isDutch: Boolean
    created: Date
    updated: Date
    isDelete: Boolean
    count: Int
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
    isDutch: Boolean
  }

  type Spending {
    total: Int!
    dutch: Int!
  }
  
  type User {
    userId: String!
    nickname: String
    thumbnail: String
    coupleId: String
    friends: [String]
    created: Date
    updated: Date
  }
  
  type Matching {
    _id: ID
    applicantId: String
    applicantName: String
    targetId: String
    targetName: String
    type: String
    completed: Boolean
    result: String
    alarm: Boolean
    created: Date
    updated: Date
  }
`;