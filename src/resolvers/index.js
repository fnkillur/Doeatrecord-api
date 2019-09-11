import Record from "../models/Record";

export default {
  Query: {
    async records(_, {userId, pageNo}) {
      return await Record.find({userId}).sort({visitedDate: -1}).limit(10 * pageNo);
    },
  },
  Mutation: {
    async createRecord(_, {input}) {
      return await Record.create(input);
    }
  }
};