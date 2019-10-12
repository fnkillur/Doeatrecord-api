import moment from "moment";
import Record from "../models/Record";
import User from "../models/User";
import Matching from "../models/Matching";

export default {
  Query: {
    async records(_, {userId, keyword, cursor = 1, pageSize = 10}) {
      const {coupleId} = await User.findOne({userId});
      
      let andList = [];
      let userList = [{userId}];
      coupleId && userList.push({userId: coupleId});
      andList.push({$or: userList});
      
      if (keyword) {
        let keywordList = [];
        const likeQuery = new RegExp(keyword);
        keywordList.push(
          {placeName: likeQuery},
          {menus: likeQuery},
          {category: likeQuery},
          {address: likeQuery}
        );
        andList.push({$or: keywordList});
      }
      
      const allRecords = await Record
        .find({$and: andList})
        .sort({visitedDate: -1, created: -1});
      
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
      const {coupleId} = await User.findOne({userId});
      
      let where = {$or: coupleId ? [{userId}, {userId: coupleId}] : [{userId}]};
      if (now) {
        where.visitedDate = {
          $gte: moment(now).startOf('month'),
          $lte: moment(now).endOf('month')
        };
      }
      
      const records = await Record.find(where);
      const total = records.reduce((sum, {money}) => sum + money, 0);
      
      where.isDutch = true;
      const dutchRecords = await Record.find(where);
      const dutch = dutchRecords.reduce((sum, {money}) => sum + money, 0) / 2;
      
      console.log(`${userId}: ${total}`);
      
      return {
        total,
        dutch
      }
    },
    async users(_, {keyword = ''}) {
      return keyword ? await User.find({nickname: new RegExp(keyword)}).sort({nickname: 1}) : [];
    },
    async receivedAlarms(_, {targetId}) {
      return await Matching.find({completed: false, targetId}).sort({created: -1});
    },
    async requestedAlarms(_, {applicantId}) {
      return await Matching.find({alarm: true, applicantId}).sort({created: -1});
    },
    async myLover(_, {myId: userId}) {
      const {coupleId} = await User.findOne({userId});
      if (!coupleId) {
        return null;
      }
      
      const {nickname, thumbnail} = await User.findOne({userId: coupleId});
      return {
        nickname: nickname,
        thumbnail: thumbnail
      };
    },
    async countedRecords(_, {userId}) {
      const {coupleId} = await User.findOne({userId});
      
      return await Record.aggregate([
        {
          $match: {
            $or: coupleId ? [{userId}, {userId: coupleId}] : [{userId}]
          }
        }, {
          $group: {
            _id: '$placeId',
            count: {$sum: 1},
            placeName: {$first: '$placeName'},
            url: {$first: '$url'},
            x: {$first: '$x'},
            y: {$first: '$y'}
          }
        }, {
          $sort: {count: -1}
        }
      ]);
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
        found.length
          ?
          await User.updateOne({userId}, {$set: {nickname, thumbnail}})
          :
          await User.create({userId, nickname, thumbnail});
        
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
    },
    async decideAlarm(_, {_id, result, type, myId, applicantId}) {
      console.log(`${_id} 알림 ${result} 처리`);
      
      try {
        await Matching.findOneAndUpdate({_id}, {$set: {result, completed: true, alarm: true}});
        if (result === 'rejected') {
          return true;
        }
        
        await User.findOneAndUpdate({userId: myId},
          type === 'couple'
            ?
            {$set: {coupleId: applicantId}}
            :
            {$addToSet: {friends: applicantId}}
        );
        await User.findOneAndUpdate({userId: applicantId},
          type === 'couple'
            ?
            {$set: {coupleId: myId}}
            :
            {$addToSet: {friends: myId}});
        
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async offAlarm(_, {_id}) {
      console.log(`${_id} 알림 끄기`);
      
      try {
        await Matching.findOneAndUpdate({_id}, {$set: {alarm: false}});
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async deleteRecord(_, {_id}) {
      console.log(`${_id} 기록 삭제`);
      
      try {
        await Record.remove({_id});
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }
};