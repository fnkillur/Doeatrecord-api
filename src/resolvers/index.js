import User from "../models/User";

export default {
	Query: {
		hello: () => 'Do Eat, Record Api!',
		getUser: async id => await User.findById(id).exec()
	},
};