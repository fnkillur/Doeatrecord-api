import mongoose from "mongoose";

const {Schema} = mongoose;

const placeSchema = new Schema({
  id: {type: String, index: true},
  x: String,
  y: String,
  category: String
});

export default mongoose.model('Place', placeSchema);