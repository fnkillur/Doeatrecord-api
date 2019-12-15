import moment from "moment";
import User from "../models/User";
import Record from "../models/Record";

const getRecords = async ({userId, keyword, now, coordinate, moreInfo, sort}, usePipeline = true) => {
  const {coupleId} = await User.findOne({userId});
  
  console.log(`유저: ${userId}, 커플: ${coupleId || '없음'}`);
  
  let andList = [];
  let userList = [{userId}];
  coupleId && userList.push({userId: coupleId});
  andList.push({$or: userList});
  
  if (now) {
    andList.push({visitedMonth: moment(now).month() + 1});
    console.log(`기준일: ${now}`);
  }
  
  if (keyword) {
    const likeQuery = new RegExp(keyword);
    andList.push({
      $or: [
        {placeName: likeQuery},
        {menus: likeQuery},
        {category: likeQuery},
        {address: likeQuery}
      ]
    });
    console.log(`검색어: ${keyword}`);
  }
  
  if (coordinate) {
    const {xMin, xMax, yMin, yMax} = coordinate;
    andList.push({x: {$gte: xMin, $lte: xMax}});
    andList.push({y: {$gte: yMin, $lte: yMax}});
    console.log(`좌표: ${xMin}, ${xMax}, ${yMin}, ${yMax}`);
  }
  
  if (moreInfo) {
    andList.push(moreInfo);
  }
  
  const pipelineList = [{$match: {$and: andList}}];
  usePipeline && pipelineList.push({
    $group: {
      _id: '$placeId',
      count: {$sum: 1},
      category: {$first: '$category'},
      placeName: {$first: '$placeName'},
      url: {$first: '$url'},
      x: {$first: '$x'},
      y: {$first: '$y'},
      score: {$avg: '$score'}
    }
  });
  pipelineList.push({
    $sort: sort || {visitedDate: -1, created: -1}
  });
  
  return await Record.aggregate(pipelineList);
};

export default {
  Query: {
    async record(_, {userId, placeId}) {
      const {coupleId} = await User.findOne({userId});
      return await Record.findOne({
        $or: coupleId ? [{userId}, {userId: coupleId}] : [{userId}],
        placeId
      }, null, {sort: {visitedDate: -1}});
    },
    async records(_, {userId, keyword, cursor = 1, pageSize = 10}) {
      const allRecords = await getRecords({userId, keyword}, false);
      
      console.log(`페이지: ${cursor}`);
      
      const nextSize = pageSize * cursor;
      const pagedRecords = allRecords.slice(0, nextSize);
      const records = [];
      pagedRecords.reduce((prev, curr) => {
        records.push({
          ...curr,
          changedYear: prev.visitedYear !== curr.visitedYear ? curr.visitedYear : 0,
          changedMonth: prev.visitedMonth !== curr.visitedMonth ? curr.visitedMonth : 0
        });
        
        return curr;
      }, {
        visitedYear: pagedRecords[0].visitedYear,
        visitedMonth: 0
      });
      
      return {
        cursor: cursor + 1,
        hasMore: allRecords.length > nextSize,
        records
      };
    },
    async mapRecords(_, {userId, xMin, xMax, yMin, yMax, keyword}) {
      return await getRecords({userId, keyword, coordinate: {xMin, xMax, yMin, yMax}});
    },
    async recordsByCount(_, {userId, now}) {
      return await getRecords({userId, now, moreInfo: {category: new RegExp('음식점')}, sort: {count: -1, score: -1}});
    },
    async recordsByScore(_, {userId, now}) {
      return await getRecords({userId, now, moreInfo: {category: new RegExp('음식점')}, sort: {score: -1}});
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
      
      let dutch = 0;
      if (now && coupleId) {
        where.isDutch = true;
        const dutchRecords = await Record.find(where);
        dutch = dutchRecords.reduce((sum, {money}) => sum + money, 0) / 2;
      }
      
      console.log(`${userId}: ${total}`);
      
      return {
        total,
        dutch
      }
    },
  },
  Mutation: {
    async createRecord(_, {input}) {
      const {_id} = input;
      
      console.log(_id ? `${_id} 기록 수정 =>` : `새로운 기록 =>`, input);
      
      try {
        _id ? await Record.updateOne({_id}, {$set: input}) : await Record.create(input);
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
    },
  }
};
