import mongoose from "mongoose";
const {Schema, model} = mongoose;

const RecordSchema = new Schema({
  userId: {type: String, required: true, index: true},
  placeId: {type: String, required: true},
  category: String,
  x: String,
  y: String,
  money: Number,
  menus: [String],
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  isDeleted: {type: Boolean, default: false}
});

export default model('Record', RecordSchema);