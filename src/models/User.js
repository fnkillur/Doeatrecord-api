import mongoose from "mongoose";
import Place from "./Place";
import Spend from "./Spend";

const {Schema} = mongoose;

const userSchema = new Schema({
  id: {type: String, index: true},
  places: [Place],
  spends: [Spend],
});

export default mongoose.model('User', userSchema);