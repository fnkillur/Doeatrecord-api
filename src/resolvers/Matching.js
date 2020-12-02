import Matching from "../models/Matching";
import User from "../models/User";

export default {
  Query: {
    async receivedAlarms(_, {targetId}) {
      return Matching.find({completed: false, targetId}).sort({created: -1});
    },
    async requestedAlarms(_, {applicantId, alarm, completed}) {
      const where = {
        applicantId,
        ...(alarm === undefined ? {} : {alarm}),
        ...(completed === undefined ? {} : {completed})
      };
      return Matching.find(where).sort({created: -1});
    },
  },
  Mutation: {
    async requestMatching(_, {applicantId, applicantName, targetId, targetName, type}) {
      try {
        await Matching.create({applicantId, applicantName, targetId, targetName, type});
        return true;
      } catch (error) {
        return false;
      }
    },
    async decideAlarm(_, {_id, result, type, myId, applicantId}) {
      try {
        if (result !== 'reject') {
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
        return false;
      }
    },
    async offAlarm(_, {_id}) {
      try {
        await Matching.findOneAndUpdate({_id}, {$set: {alarm: false}});
        return true;
      } catch (error) {
        return false;
      }
    },
  }
};
