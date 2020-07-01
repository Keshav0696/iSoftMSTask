var mongoose = require('mongoose');

// Vendor Schema
var ShipmentSchema = mongoose.Schema({
  shipper_reference : String,
  commodity : String,
  price : Number,
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
  shipmentNO : String,
  modeType : {
      type : mongoose.Schema.Types.ObjectId,
      ref:'ShipmentMode'
  },
  vendor_id: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  user_id : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User" 
  },
  status : {
      type : String,
      enum: [ "BOOKED", "INTRANSIT", "DELIVERED", "INVOICED", "ARCHIVED"]
  },
  paymentStatus : {
    type: String,
    enum: ["PAID","UNPAID"]
  },
  paymentDueDate : {
    type: Date,
    default : Date.now
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