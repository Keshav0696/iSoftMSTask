var mongoose = require('mongoose');

// Vendor Schema
var ShipmentSchema = mongoose.Schema({
  shipper_reference : String,
  commodity : String,
  pickupInfo:{
    business_name: String,
    address : String,
    contact_name : String,
    contact_no : String,
    contact_email: String,
    scheduled_date: {
      type : Date,
      default : Date.now
    },
    estimated_date : {
      type : Date,
      default : Date.now
    }
  },
  deliveryInfo:{
    business_name: String,
    commodity : String,
    address : String,
    contact_name : String,
    contact_no : String,
    contact_email: String,
    scheduled_date: {
      type : Date
    },
    estimated_date : {
      type : Date
    }
  },
  shipmentNO : String,
  deliveryInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
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

var Shipment = module.exports = mongoose.model('Shipment', ShipmentSchema);