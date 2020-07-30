
const mongoose = require('mongoose');

const vendorRateSchema = new mongoose.Schema({
    vendor_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    fbaftl: {
        rate: {
            type: Number,
            required: true,
            default: 0
        },
        pickupRangeCode: {
            type: String,
            required: true
        },
        freeRadius: {
            type: Number,
            required: true,
            default: 25
        },
        deadHeadRate: {
            type: Number,
            required: true,
            default: 1
        },
        detTime: {
            type: Number,
            required: true,
            default: 4
        },
        detCharge: {
            type: Number,
            required: true,
            default: 0
        },
        availableTrucks: {
            type: Number,
            required: true,
            default: 0
        },
    },
    fbaContainer: {
        rate: {
            type: Number,
            required: true,
            default: 0
        },
        wareHouse: {
            type: String,
            required: true
        },
        maxDetentionTime: {
            type: Number,
            required: true,
            default: 0
        },
        detChargePerHour: {
            type: Number,
            required: true,
            default: 0
        },
        maxCargoWeight: {
            type: Number,
            required: true,
            default: 40000
        },
        handlingCapacity: {
            type: Number,
            required: true,
            default: 0
        },
    },
    fbaPallet: {
        freePickupRadius: {
            type: Number,
            required: true,
            default: 25
        },
       
        palletsNeeded: {
            type: Number,
            required: true,
            default: 0
        },
        palletMaxLength: {
            type: Number,
            required: true,
            default: 48
        },
        palletMaxWeight: {
            type: Number,
            required: true,
            default: 48
        },
        palletMaxHeight: {
            type: Number,
            required: true,
            default: 72
        },
        rates : [{
          wareHouse : {
            type: String,
            required: true
          },
          rate : {
            type: Number,
            required: true,
            default: 0
          },
          location: {
            type: String,
            required: true,
            default: 0
          },
          expDate : {
            type: Date,
            required: Date.now,
            default: 0 
          }
        }]

    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }

});
var VendorRate = mongoose.model('VendorRate', vendorRateSchema)