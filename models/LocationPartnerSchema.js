const mongoose = require("mongoose");

const LocationPartnerSchema = new mongoose.Schema({

  // ---------- BASIC INFO ----------
  partnerName: { type: String, required: true },
  companyName: String,

  contactPerson: String,
  phone: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true },

  // ---------- LOCATION ----------
  address: String,
  city: String,
  state: String,
  pincode: String,

  location: {
    lat: Number,
    lng: Number
  },

  // ---------- VERIFICATION ----------
  kyc: {
    pan: String,
    gst: String,
    aadhaar: String,
  },

  documents: {
    propertyProofUrl: String,
    idProofUrl: String,
    agreementUrl: String
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  // ---------- REVENUE MODEL ----------
  revenueModel: {
    type: {
      type: String,
      enum: ["percentage", "fixed", "hybrid"]
    },

    percentageShare: Number,     // e.g. 30%
    fixedMonthlyRent: Number,    // e.g. ₹5000
    minGuarantee: Number,        // optional

    perParcelRate: Number        // optional usage based
  },

  // ---------- REVENUE TRACKING ----------
  revenueStats: {
    totalRevenueGenerated: { type: Number, default: 0 },
    partnerShareEarned: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    lastPayoutDate: Date
  },

  // ---------- LOCKER RELATION ----------
  lockers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Locker"
  }],

  // ---------- STATUS ----------
  googleId: String,

isApproved: Boolean,
isActive: Boolean,

}, { timestamps: true });

module.exports = mongoose.model("LocationPartner", LocationPartnerSchema);
