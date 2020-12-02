import moment from "moment";
import User from "../models/User";
import Record from "../models/Record";

const getRecords = async ({userIds = [], keyword, now, coordinate, moreInfo, sort}, usePipeline = true) => {
  if (!userIds.filter(id => !!id).length) {
    return [];
  }
  
  let andList = [];
  
  let userList = [];
  const users = await User.find({
    $or: userIds.map(userId => {
      userList.push({userId});
      return {userId};
    }),
  });
  users.map(({coupleId}) => coupleId && userList.push({userId: coupleId}));
  andList.push({$or: userList});
  
  if (now) {
    andList.push({
      visitedMonth: moment(now).month() + 1,
      visitedYear: moment(now).year(),
    });
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
  }
  
  if (coordinate) {
    const {xMin, xMax, yMin, yMax} = coordinate;
    andList.push({x: {$gte: xMin, $lte: xMax}});
    andList.push({y: {$gte: yMin, $lte: yMax}});
  }
  
  if (moreInfo) {
    andList.push(moreInfo);
  }
  
  const pipelineList = [{
    $match: {
      $and: andList,
    },
  }, {
    $project: {
      _id: 1,
      placeId: 1,
      category: 1,
      placeName: 1,
      userId: 1,
      address: 1,
      visitedDate: 1,
      menus: 1,
      money: 1,
      isDutch: 1,
      url: 1,
      x: 1,
      y: 1,
      score: {
        $cond: {
          if: {$eq: ["$score", 0]},
          then: null,
          else: "$score",
        },
      },
    },
  }];
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
  
  return Record.aggregate(pipelineList);
};

export default {
  Query: {
    async record(_, {userId, placeId}) {
      const {coupleId} = await User.findOne({userId});
      return Record.findOne({
        $or: coupleId ? [{userId}, {userId: coupleId}] : [{userId}],
        placeId
      }, null, {sort: {visitedDate: -1}});
    },
    async records(_, {userId, keyword, cursor = 1, pageSize = 10}) {
      const allRecords = await getRecords({userIds: [userId], keyword}, false);
      
      const nextSize = pageSize * cursor;
      const records = allRecords.slice(0, nextSize);
      
      return {
        cursor: cursor + 1,
        hasMore: allRecords.length > nextSize,
        records
      };
    },
    async mapRecords(_, {userId, xMin, xMax, yMin, yMax}) {
      return getRecords({userIds: [userId], coordinate: {xMin, xMax, yMin, yMax}});
    },
    async recordsByCount(_, {userId, now}) {
      return await getRecords({
        userIds: [userId],
        now,
        moreInfo: {category: new RegExp('음식점')},
        sort: {count: -1, score: -1}
      });
    },
    async recordsByScore(_, {userId, now}) {
      return await getRecords({
        userIds: [userId],
        now,
        moreInfo: {category: new RegExp('음식점'), score: {$gt: 0}},
        sort: {score: -1}
      });
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
      const {total, dutch} = records.reduce(({total, dutch}, {money, isDutch}) => {
        return {
          total: total + money,
          dutch: dutch + (isDutch ? money : 0),
        };
      }, {total: 0, dutch: 0});
      
      return {
        total,
        dutch: dutch / 2,
      };
    },
    async monthlySpending(_, {userId, now, count = 12}) {
      const startDate = moment(now).subtract(count - 1, 'months').startOf('month');
      const {coupleId} = await User.findOne({userId});
      const pipelineList = [{
        $match: {
          visitedDate: {
            $gte: startDate.toDate(),
            $lte: moment(now).endOf('month').toDate(),
          },
          $or: coupleId ? [{userId}, {userId: coupleId}] : [{userId}],
        },
      }, {
        $group: {
          _id: {year: '$visitedYear', month: '$visitedMonth'},
          year: {$first: '$visitedYear'},
          label: {$first: '$visitedMonth'},
          count: {$sum: 1},
          spending: {$sum: '$money'},
        },
      }, {
        $sort: {year: 1, label: 1},
      }];
      
      return await Record.aggregate(pipelineList);
    },
  },
  Mutation: {
    async createRecord(_, {input}) {
      try {
        const {_id} = input;
        _id ? await Record.updateOne({_id}, {$set: input}) : await Record.create(input);
        
        return true;
      } catch (error) {
        return false;
      }
    },
    async deleteRecord(_, {_id}) {
      try {
        await Record.remove({_id});
        return true;
      } catch (error) {
        return false;
      }
    },
  }
};
