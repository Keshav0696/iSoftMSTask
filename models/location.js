const mongoose = require('mongoose');


const locationSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true
    },
    lastName : {
        type: String,
        required: true
    },
    phoneNo : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    address : {
        type: String,
        required: true
    },
    city : {
        type: String,
        required: true
    },
    state : {
        type: String,
        required: true
    },
    zip_code : {
        type: String,
        required: true
    },
    vendor_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    createdAt: { type: Date, required: true, default: Date.now },
});


module.exports = mongoose.model('Location', locationSchema);