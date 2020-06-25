var mongoose = require('mongoose');

// Vendor Schema
var ShipmentSchema = mongoose.Schema({
  pickupAdd: String,
  shipmentNO : String,
  deliveryAdd: String,
  modeType : {
      type : mongoose.Schema.Types.ObjectId,
      ref:'ShipmentMode'
  },
  vendor_id: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Vendor"
  },
  status : {
      type : String,
      enum: [ "BOOKED", "INTRANSIT", "DELIVERED", "INVOICED", "ARCHIVED"]
  },
  paymentStatus : {
    type: String,
    enum: ["PAID","UNPAID"]
  }
});

var Shipment = module.exports = mongoose.model('Shipment', ShipmentSchema);