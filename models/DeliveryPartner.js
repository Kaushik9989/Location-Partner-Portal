const mongoose = require("mongoose");

const CheckLogSchema = new mongoose.Schema({

    checkInTime: {
        type: Date,
        required: true
    },

    checkOutTime: {
        type: Date
    },

    checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    },

    checkedOutBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    }

}, { _id: false });


const DeliveryPartnerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
photo: {
    type: String
},
    isPhoneVerified: {
        type: Boolean,
        default: false
    },

    // multiple companies
    deliveryCompanies: [{
        type: String,
        enum: [
            "swiggy",
            "zomato",
            "amazon",
            "flipkart",
            "blinkit",
            "zepto",
            "other"
        ]
    }],

    isCheckedIn: {
        type: Boolean,
        default: false
    },

    checkInTime: {
        type: Date
    },

    checkOutTime: {
        type: Date
    },

    checkInHistory: [CheckLogSchema],

    status: {
        type: String,
        enum: ["pending", "active", "blocked"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("DeliveryPartner", DeliveryPartnerSchema);