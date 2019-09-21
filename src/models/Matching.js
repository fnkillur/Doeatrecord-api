import mongoose from "mongoose";

const {Schema, model} = mongoose;

const MatchingSchema = new Schema({
	applicant: String,
	target: String,
	type: String,
	completed: {type: Boolean, default: false},
	result: {type: String, default: 'wait'},
	alarm: {type: Boolean, default: true},
	created: {type: Date, default: Date.now},
	updated: {type: Date, default: Date.now}
});

export default model('Matching', MatchingSchema);