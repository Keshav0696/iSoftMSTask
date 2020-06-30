var mongoose = require('mongoose');

// Vendor Schema
var VendorSchema = mongoose.Schema({
  firstName: {
    type: String
  },
  lastName : {
    type : String
  },
  description:{
      type:String,
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

var Vendor = module.exports = mongoose.model('Vendor', VendorSchema);