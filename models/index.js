'user strict';
const mongoose = require('mongoose');
const config = require('../config');
mongoose.connect(config.dbURI, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', function(err) {
	if(err) throw err;
});