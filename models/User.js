var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
  fullname: {
    type: String,
    index:true
  },
  roleId : {
    type: mongoose.Types.ObjectId
  },
  address : String,
  phoneNo : String,
  password: {
    type: String
  },
  email: {
    type: String
  },
  facebookId : String,
  status  :  String,
  token: String,
  type : String

});

var User = module.exports = mongoose.model('User', UserSchema);
module.exports = User
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
  }

  module.exports.getUserByEmail = function(username, callback){
    var query = {email: username};
    User.findOne(query, callback);
  }
  
  module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
  }
  
  module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
    });
  }