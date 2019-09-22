import moment from "moment";
import Record from "../models/Record";
import User from "../models/User";
import Matching from "../models/Matching";

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
      const pagedRecords = allRecords.slice(0, nextSize);
      const records = [];
      
      pagedRecords.length && pagedRecords
        .map(({_doc}) => ({..._doc}))
        .reduce((prev, curr) => {
          records.push({
            ...curr,
            changedYear: prev.visitedYear !== curr.visitedYear ? curr.visitedYear : 0,
            changedMonth: prev.visitedMonth !== curr.visitedMonth ? curr.visitedMonth : 0
          });
          
          return curr;
        }, {
          visitedYear: pagedRecords[0]._doc.visitedYear,
          visitedMonth: 0
        });
      
      console.log(`${userId}: No - ${cursor} / Keyword - ${keyword || '없음'}`);
      
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
    },
    async users(_, {keyword = ''}) {
      return keyword ? await User.find({nickname: new RegExp(keyword)}).sort({nickname: 1}) : [];
    },
    async receivedAlarms(_, {targetId}) {
      return await Matching.find({alarm: true, targetId}).sort({created: -1});
    },
    async requestedAlarms(_, {applicantId}) {
      return await Matching.find({alarm: true, applicantId}).sort({created: -1});
    }
  },
  Mutation: {
    async createRecord(_, {input}) {
      console.log(input);
      
      try {
        return await Record.create(input);
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    async createUser(_, {userId, nickname, thumbnail}) {
      console.log(`${userId} (${nickname}): ${thumbnail}`);
      
      try {
        const found = await User.find({userId});
        found.length ? await User.updateOne({userId}, {$set: {nickname, thumbnail}}) : await User.create({
          userId,
          nickname,
          thumbnail
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async requestMatching(_, {applicantId, applicantName, targetId, targetName, type}) {
      console.log(`${applicantId}가 ${targetId}에게 요청`);
      
      try {
        await Matching.create({applicantId, applicantName, targetId, targetName, type});
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }
};