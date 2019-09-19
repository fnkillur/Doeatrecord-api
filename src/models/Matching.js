import mongoose from "mongoose";

const {Schema, model} = mongoose;

const MatchingSchema = new Schema({
	applicant: String,
	target: String,
	completed: Boolean,
	result: String,
	created: {type: Date, default: Date.now},
	updated: {type: Date, default: Date.now}
});

export default model('Matching', MatchingSchema);