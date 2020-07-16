var mongoose = require('mongoose');
const { truncate } = require('fs');

const vendorBizInfoSSchema = new mongoose.Schema({
    shipperLogo: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    streetAdd: {
        type: String,
        required: true
    },
    DBA: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip_code: {
        type: String,
        required: true
    },
    vendor_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    createdAt: { type: Date, required: true, default: Date.now },
});


module.exports = mongoose.model('VendorBizInfo', vendorBizInfoSSchema);