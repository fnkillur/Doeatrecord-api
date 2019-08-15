import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

const url = 'mongodb+srv://admin:Teo.dor1024@doeatrecord-cgmwf.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(url, {useNewUrlParser: true});
mongoose.connection.once('open', () => console.log(`Connected to mongo at ${url}`));