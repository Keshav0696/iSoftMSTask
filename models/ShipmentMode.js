var mongoose = require('mongoose');

// Vendor Schema
var ShipmentModeSchema = mongoose.Schema({
  name: {
    type: String,
    index:true
  },
  
  rate: String,
  maxWeight : Number,
  deadheadRate : Number,

  freeRadius : Number,
  detTime  : Number,
  detCostPerHour : Number,
  noOfTruck : Number,

});

var ShipmentMode = module.exports = mongoose.model('ShipmentMode', ShipmentModeSchema);