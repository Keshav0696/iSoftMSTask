var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
  name: {
    type: String,
    required : true
  },

  address : {
    type : String,
    required : true
  },
  phoneNo : {
    type : String,
    required : true
  },
  email: {
    type: String,
    required : true
  },
  created_at: {
    type : Date,
    default : Date.now
  },
  updated_at: {
     type : Date,
     default : Date.now
   }

});

var User = module.exports = mongoose.model('User', UserSchema);
module.exports = User

