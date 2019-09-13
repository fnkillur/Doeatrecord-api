import Record from "../models/Record";
import moment from "moment";

export default {
  Query: {
    async records(_, {userId, keyword, cursor = 1, pageSize = 10}) {
      const where = {userId};
      if (keyword) {
        const likeQuery = new RegExp(keyword);
        where.$or = [
          {placeName: likeQuery},
          {menus: likeQuery},
          {category: likeQuery},
          {address: likeQuery}
        ];
      }
      
      const allRecords = await Record.find(where).sort({visitedDate: -1});
      const nextSize = pageSize * cursor;
      const records = allRecords.slice(0, nextSize);
      
      console.log(`${userId}: No - ${cursor} / Keyword - ${keyword}`);
      
      return {
        cursor: cursor + 1,
        hasMore: allRecords.length > nextSize,
        records
      };
    },
    async spending(_, {userId, now}) {
      const where = {userId};
      if (now) {
        where.visitedDate = {
          $gte: moment(now).startOf('month'),
          $lte: moment(now).endOf('month')
        };
      }
      
      const records = await Record.find(where);
      const total = records.reduce((sum, {money}) => sum + money, 0);
      
      console.log(`${userId}: ${total}`);
      
      return {
        total,
        dutch: total / 2
      }
    }
  },
  Mutation: {
    async createRecord(_, {input}) {
      console.log(input);
      return await Record.create(input);
    }
  }
};