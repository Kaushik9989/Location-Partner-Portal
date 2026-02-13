const mongoose = require("mongoose");

const PartnerHostingRequestSchema = new mongoose.Schema({
  // ---------- BASIC & COMPANY ----------
  partnerName: { type: String, required: true, trim: true }, // Mapped from 'Partner/Brand Name'
  companyName: { type: String, trim: true },               // Mapped from 'Registered Company Name'
  
  // ---------- CONTACT ----------
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },

  // ---------- LOCATION ----------
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },

  // ---------- PREFERENCES ----------
  preferredModel: {
    type: String,
    enum: ["full_partner_profit", "revenue_share", "franchise", "fixed_rent", "hybrid", "custom"],
    default: "revenue_share"
  },

  // ---------- ADMIN FLOW ----------
  status: {
    type: String,
    enum: ["submitted", "reviewing", "approved", "rejected"],
    default: "submitted",
    index: true
  },
  adminNotes: String,
  reviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("PartnerHostingRequest", PartnerHostingRequestSchema);