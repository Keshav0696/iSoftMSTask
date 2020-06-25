var mongoose = require('mongoose');

// Vendor Schema
var ShipDocSchema = mongoose.Schema({
 shipment_id : {
     type: mongoose.Schema.Types.ObjectId,
     ref : "Shipment"
 },
 doc_name : String,
 doc_path : String
});

var ShipDoc = module.exports = mongoose.model('ShipDoc', ShipDocSchema);