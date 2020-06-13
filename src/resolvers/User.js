import User from "../models/User";

export default {
  Query: {
    async user(_, {userId}) {
      return User.findOne({userId});
    },
    async users(_, {userId = '', keyword = ''}) {
      return User
        .find({nickname: new RegExp(keyword), userId})
        .sort({nickname: 1});
    },
    async myLover(_, {userId}) {
      const {coupleId} = await User.findOne({userId});
      if (!coupleId) {
        return null;
      }
      
      return User.findOne({userId: coupleId});
    },
    async myFriends(_, {userId, keyword = ''}) {
      const {friends} = await User.findOne({userId});
      
      return User.find({userId: {$in: friends}, nickname: new RegExp(keyword)});
    },
    async unMatchedUsers(_, {userId, keyword = '', type}) {
      const {coupleId, friends = []} = await User.findOne({userId});
      let excludeList = friends.concat(userId);
      coupleId && excludeList.push(coupleId);
      
      return User
        .find({
          $or: [{userId: new RegExp(keyword)}, {nickname: new RegExp(keyword)}],
          userId: {$nin: excludeList},
          ...(type === 'couple' ? {coupleId: ''} : {}),
        })
        .sort({nickname: 1});
    },
  },
  Mutation: {
    async createUser(_, {userId, nickname}) {
      console.log(`${userId} (${nickname})`);
      
      try {
        const found = await User.find({userId});
        console.log(found);
        !found.length && await User.create({userId, nickname});
        
        return true;
      } catch (error) {
        console.error(error);
        
        return false;
      }
    },
    async unFollow(_, {userId, friendId}) {
      console.log(`${userId} 가 ${friendId} 와 언팔로우`);
      
      try {
        await User.findOneAndUpdate({userId}, {$pull: {friends: friendId}});
        await User.findOneAndUpdate({userId: friendId}, {$pull: {friends: userId}});
        
        return true;
      } catch (error) {
        console.error(error);
        
        return false;
      }
    },
    async breakUp(_, {userId, coupleId}) {
      console.log(`${userId}와 ${coupleId} 헤어짐`);
      
      try {
        await User.findOneAndUpdate({userId}, {$set: {coupleId: ''}});
        await User.findOneAndUpdate({userId: coupleId}, {$set: {coupleId: ''}});
        
        return true;
      } catch (error) {
        console.error(error);
        
        return false;
      }
    },
  }
};
