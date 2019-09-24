import mongoose from "mongoose";

const {Schema, model} = mongoose;

const UserSchema = new Schema({
  userId: {type: String, required: true, index: true},
  nickname: String,
  thumbnail: String,
  coupleId: {type: String, default: ''},
  friends: [String],
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now}
});

export default model('User', UserSchema);