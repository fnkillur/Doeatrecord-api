import User from "../models/User";

export default {
  Query: {
    async users(_, {keyword = ''}) {
      return keyword ? await User.find({nickname: new RegExp(keyword)}).sort({nickname: 1}) : [];
    },
    async myLover(_, {myId: userId}) {
      const {coupleId} = await User.findOne({userId});
      if (!coupleId) {
        return null;
      }
    
      const {nickname} = await User.findOne({userId: coupleId});
      return {nickname};
    },
  },
  Mutation: {
    async createUser(_, {userId, nickname}) {
      console.log(`${userId} (${nickname})`);
    
      try {
        const found = await User.find({userId});
        await !found.length && User.create({userId, nickname});
      
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  }
};
