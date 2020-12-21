import {gql} from "apollo-server-express";

export default gql`
  scalar Date

  type Query {
    records(userId: String!, keyword: String, cursor: Int, pageSize: Int, isMoreFive: Boolean): Records!
    mapRecords(userId: String!, xMin: String!, xMax: String!, yMin: String!, yMax: String!): [Record]
    recordsByCount(userId: String!, now: Date): [Record]
    recordsByScore(userId: String!, now: Date): [Record]
    spending(userId: String!, now: Date): Spending!
    monthlySpending(userId: String!, now: Date, count: Int): [MonthlySpending]
    monthlyPie(userId: String!, now: Date): [MonthlyPie]
    user(userId: String!): User
    users(userId: String, keyword: String): [User]
    myLover(userId: String!): User
    myFriends(userId: String!, keyword: String): [User]
    unMatchedUsers(userId: String!, keyword: String, type: String!): [User]
    receivedAlarms(targetId: String!): [Matching]
    requestedAlarms(applicantId: String!, alarm: Boolean, completed: Boolean): [Matching]
  }

  type Mutation {
    createRecord(input: NewRecord!): Record
    createUser(userId: String!, nickname: String): Boolean
	  requestMatching(applicantId: String!, applicantName: String!, targetId: String!, targetName: String! type: String!): Boolean
    decideAlarm(_id: ID!, result: String!, type: String!, myId: String!, applicantId: String!): Boolean
    offAlarm(_id: ID!): Boolean
    deleteRecord(_id: ID!): Boolean
    unFollow(userId: String!, friendId: String!): Boolean
    breakUp(userId: String!, coupleId: String!): Boolean
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
    placeId: String
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
    placeId: String
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
    settlement: Int!
  }
  
  type MonthlySpending {
    label: String!
    spending: Int!
  }
  
  type MonthlyPie {
    category: String!
    count: Int!
    spending: Int!
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
