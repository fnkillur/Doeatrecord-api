import moment from "moment";
import User from "../models/User";
import Record from "../models/Record";

const getAndList = async ({userId, keyword, now, coordinate}) => {
  if (!userId) {
    return [];
  }
  
  let andList = [];
  const {coupleId} = await User.findOne({userId});
  // 내 개인 기록 + 내 데이트 기록 + 커플의 데이트 기록
  andList.push({$or: [{userId}, {userId: coupleId, isDutch: true}]});
  
  // 기간
  if (now) {
    andList.push({
      visitedMonth: moment(now).month() + 1,
      visitedYear: moment(now).year(),
    });
  }
  
  // 검색어
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
  
  // 기록처 좌표
  if (coordinate) {
    const {xMin, xMax, yMin, yMax} = coordinate;
    andList.push({x: {$gte: xMin, $lte: xMax}});
    andList.push({y: {$gte: yMin, $lte: yMax}});
  }
  
  return andList;
};

const getRecords = async ({userId, keyword, now, coordinate, moreInfo, sort}, usePipeline = true) => {
  let andList = await getAndList({userId, keyword, now, coordinate});
  
  if (moreInfo) {
    andList.push(moreInfo);
  }
  
  if (!andList.length) {
    return [];
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
      money: {
        $cond: {
          if: {$eq: ["$money", null]},
          then: 0,
          else: "$money",
        },
      },
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
    async records(_, {userId, keyword, cursor = 1, pageSize = 10, isMoreFive = false}) {
      let where = {userId, keyword};
      if (isMoreFive) {
        where.moreInfo = {
          $or: [
            {isDutch: true, money: {$gte: 100000}},
            {isDutch: false, money: {$gte: 50000}},
          ],
        };
      }
      
      const allRecords = await getRecords(where, false);
      
      const nextSize = pageSize * cursor;
      const records = allRecords.slice(0, nextSize);
      
      return {
        cursor: cursor + 1,
        hasMore: allRecords.length > nextSize,
        records
      };
    },
    async mapRecords(_, {userId, xMin, xMax, yMin, yMax}) {
      return getRecords({userId, coordinate: {xMin, xMax, yMin, yMax}});
    },
    async recordsByCount(_, {userId, now}) {
      return getRecords({
        userId,
        now,
        moreInfo: {category: new RegExp('음식점|카페|술')},
        sort: {count: -1, score: -1}
      });
    },
    async recordsByScore(_, {userId, now}) {
      return getRecords({
        userId,
        now,
        moreInfo: {category: new RegExp('음식점|카페|술'), score: {$gt: 0}},
        sort: {score: -1}
      });
    },
    async spending(_, {userId, now}) {
      const allRecords = await getRecords({userId, now}, false);
      const {total, my, lover} = allRecords.reduce(({total, my, lover}, record) => {
        const isMy = record.userId === userId;
        
        return {
          total: total + (record.isDutch ? record.money / 2 : record.money),
          my: my + ((isMy && record.isDutch) ? record.money : 0),
          lover: lover + (isMy ? 0 : record.money),
        };
      }, {total: 0, my: 0, lover: 0});
      
      return {
        // 내 지출은 데이트 비용으로 결제한 건 절반만 포함 (정산하니까)
        total,
        // 데이트 비용
        dating: (my + lover) / 2,
        // 정산
        settlement: (my - lover) / 2,
      };
    },
    async monthlyPie(_, {userId, now}) {
      const andList = await getAndList({userId, now});
      
      const pipelineList = [{
        $match: {
          $and: andList.concat({category: {$ne: '기타'}}),
        },
      }, {
        $group: {
          _id: '$category',
          category: {$first: '$category'},
          count: {$sum: 1},
          spending: {
            $sum: {
              $cond: [{$eq: ["$isDutch", true]}, {$divide: ["$money", 2]}, "$money"],
            }
          },
        },
      }, {
        $sort: {spending: -1},
      }];
      
      const results = await Record.aggregate(pipelineList);
      if (results.length < 5) {
        return results;
      }
      
      const last = results.slice(4).reduce((last, {spending}, index) => {
        return {
          _id: '기타',
          category: '기타',
          count: index + 1,
          spending: last.spending + spending,
        };
      }, {spending: 0});
      return results.slice(0, 4).concat(last);
    },
    async monthlySpendingTrend(_, {userId, now, count = 12}) {
      const startDate = moment(now || new Date()).subtract(count - 1, 'months').startOf('month');
      const {coupleId} = await User.findOne({userId});
      
      const pipelineList = [{
        $match: {
          visitedDate: {
            $gte: startDate.toDate(),
            $lte: moment(now || new Date()).endOf('month').toDate(),
          },
          $or: coupleId ? [{userId}, {userId: coupleId}] : [{userId}],
        },
      }, {
        $group: {
          _id: {year: '$visitedYear', month: '$visitedMonth'},
          year: {$first: '$visitedYear'},
          label: {$first: '$visitedMonth'},
          count: {$sum: 1},
          spending: {
            $sum: {
              $cond: {
                if: {$eq: ["$isDutch", true]},
                then: {$divide: ["$money", 2]},
                else: "$money",
              },
            }
          },
        },
      }, {
        $sort: {year: 1, label: 1},
      }];
      
      return Record.aggregate(pipelineList);
    },
  },
  Mutation: {
    async createRecord(_, {input}) {
      try {
        const {_id} = input;
        const result = _id ? await Record.updateOne({_id}, {$set: input}) : await Record.create(input);
        
        return Record.findById(result._id || _id);
      } catch (error) {
        return null;
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
