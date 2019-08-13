import mongoose from "mongoose";

const {Schema} = mongoose;

const spendSchema = new Schema({
  id: {type: String, index: true},
  userId: String,
  placeId: String,
  money: Number
});

export default mongoose.model('Spend', spendSchema);