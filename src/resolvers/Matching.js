import Matching from "../models/Matching";
import User from "../models/User";

export default {
  Query: {
    async receivedAlarms(_, {targetId}) {
      return Matching.find({completed: false, targetId}).sort({created: -1});
    },
    async requestedAlarms(_, {applicantId, alarm}) {
      return Matching.find({alarm, applicantId}).sort({created: -1});
    },
  },
  Mutation: {
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
        if (result !== 'rejected') {
          await User.findOneAndUpdate({userId: myId},
            type === 'couple' ?
              {$set: {coupleId: applicantId}}
              :
              {$addToSet: {friends: applicantId}}
          );
          await User.findOneAndUpdate({userId: applicantId},
            type === 'couple' ?
              {$set: {coupleId: myId}}
              :
              {$addToSet: {friends: myId}});
        }
      
        await Matching.findOneAndUpdate({_id}, {$set: {result, completed: true, alarm: true}});
      
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
  }
};
