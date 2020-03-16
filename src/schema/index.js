import {gql} from "apollo-server-express";

export default gql`
  scalar Date

  type Query {
    record(userId: String!, placeId: String!): Record
    records(userId: String!, keyword: String, cursor: Int, pageSize: Int): Records!
    mapRecords(userId: String!, xMin: String!, xMax: String!, yMin: String!, yMax: String!, keyword: String): [Record]
    recordsByCount(userId: String!, now: Date): [Record]
    recordsByScore(userId: String!, now: Date): [Record]
    spending(userId: String!, now: Date): Spending!
    user(userId: String!): User
    users(keyword: String): [User]
    myLover(myId: String!): User
    myFriends(userId: String!): [User]
    receivedAlarms(targetId: String!): [Matching]
    requestedAlarms(applicantId: String!, alarm: Boolean): [Matching]
  }

  type Mutation {
    createRecord(input: NewRecord!): Boolean
    createUser(userId: String!, nickname: String): Boolean
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
	  isMine: Boolean
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
    score: Float
    isDutch: Boolean
    created: Date
    updated: Date
    isDelete: Boolean
    count: Int
  }

  input NewRecord {
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
    menus: [String]
    money: Int
    score: Float
    isDutch: Boolean
  }

  type Spending {
    total: Int!
    dutch: Int!
  }
  
  type User {
    userId: String!
    nickname: String
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
