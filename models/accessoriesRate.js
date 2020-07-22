
const mongoose = require('mongoose');

const accessoriesRateSchema = new mongoose.Schema({
    insidePickup: {
        type: Number,
        required: true,
        default: 0
    },
    liftGatePickup: {
        type: Number,
        required: true,
        default: 0
    },
    limitedAccesspickup: {
        type: Number,
        required: true,
        default: 0
    },
    insideDelivery: {
        type: Number,
        required: true,
        default: 0
    },
    liftGateDelivery: {
        type: Number,
        required: true,
        default: 0
    },
    limitedAccessDelivery: {
        type: Number,
        required: true,
        default: 0
    },
    residentialDelivery: {
        type: Number,
        required: true,
        default: 0
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
            default: 0
        },
        handlingCapacity: {
            type: Number,
            required: true,
            default: 0
        },
    },
    fbaPallet: {
        rate: {
            type: Number,
            required: true,
            default: 0
        },
        freePickupRadius: {
            type: Number,
            required: true,
            default: 0
        },
        wareHouse: {
            type: String,
            required: true
        },
        palletsNeeded: {
            type: Number,
            required: true,
            default: 0
        },
        palletLimitation: {
            maxLength: {
                type: Number,
                required: true,
                default: 0
            },
            maxWeight: {
                type: Number,
                required: true,
                default: 0
            },
            maxHeight: {
                type: Number,
                required: true,
                default: 0
            }
        },

    },

    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('accessoriesRate', accessoriesRateSchema);