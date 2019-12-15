import RecordResolver from "./Record";
import UserResolver from "./User";
import MatchResolver from "./Matching";

export default {
  Query: {
    ...RecordResolver.Query,
    ...UserResolver.Query,
    ...MatchResolver.Query,
  },
  Mutation: {
    ...RecordResolver.Mutation,
    ...UserResolver.Mutation,
    ...MatchResolver.Mutation,
  }
};
