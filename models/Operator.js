var mongoose = require('mongoose');

// Vendor Schema
var OperatorSchema = mongoose.Schema({
  name: {
    type: String,
    index:true
  },
  phoneNo : String,
  email: String,
  address: String,
  state : String,
  country : String,
  status  : {
    type : String,
    enum : ["active", "deactive"],
   },
   create_at: {
    type : Date,
    default : Date.now
  },
  updated_at: {
     type : Date,
     default : Date.now
   }
});

var Operator = module.exports = mongoose.model('Operator', OperatorSchema);