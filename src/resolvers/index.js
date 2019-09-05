import Record from "../models/Record";

export default {
  Query: {
    async records(_, {userId}) {
      return await Record.find({userId}).sort('created');
    },
  },
  Mutation: {
    async createRecord(_, {input}) {
      return await Record.create(input);
    }
  }
};