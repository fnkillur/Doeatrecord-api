import User from "../models/User";

export default {
  Query: {
    async user(_, {userId}) {
      return User.findOne({userId});
    },
    async users(_, {keyword = ''}) {
      return await User
        .find({nickname: new RegExp(keyword)})
        .sort({nickname: 1});
    },
    async myLover(_, {userId}) {
      const {coupleId} = await User.findOne({userId});
      if (!coupleId) {
        return null;
      }
      
      const {nickname} = await User.findOne({userId: coupleId});
      
      return {nickname};
    },
    async myFriends(_, {userId}) {
      const {friends} = await User.findOne({userId});
      
      return friends.map(async friend => User.findOne({userId: friend}));
    },
    async unknownUsers(_, {userId, keyword = '', type}) {
      const {coupleId, friends = []} = await User.findOne({userId});
      const where = type === 'couple' ?
        {
          userId: {$ne: userId},
          coupleId: '',
        }
        :
        {
          userId: {$nin: [...friends, coupleId, userId]},
        };
      
      return await User
        .find({
          nickname: new RegExp(keyword),
          ...where,
        })
        .sort({nickname: 1});
    },
  },
  Mutation: {
    async createUser(_, {userId, nickname}) {
      console.log(`${userId} (${nickname})`);
      
      try {
        const found = await User.find({userId});
        !found.length && await User.create({userId, nickname});
        
        return true;
      } catch (error) {
        console.error(error);
        
        return false;
      }
    },
  }
};
