var mongoose = require('mongoose');

// Vendor Schema
var ShipmentSchema = mongoose.Schema({
  pickupAdd: String,
  
  deliveryAdd: String,
  modeType : {
      type : mongoose.Schema.Types.ObjectId,
      ref:'ShipmentMode'
  },
  status : {
      type : String,
      enum: ["PAID","UNPAID"]
  }
});

var Shipment = module.exports = mongoose.model('Shipment', ShipmentSchema);