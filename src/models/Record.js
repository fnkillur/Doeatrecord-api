import mongoose from "mongoose";

const {Schema, model} = mongoose;

const RecordSchema = new Schema({
  userId: {type: String, required: true, index: true},
  placeId: {type: String, required: true},
  placeName: String,
  category: String,
  address: String,
  url: String,
  x: String,
  y: String,
  visitedDate: Date,
  visitedYear: Number,
  visitedMonth: Number,
  menus: [String],
  money: Number,
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  isDeleted: {type: Boolean, default: false}
});

export default model('Record', RecordSchema);