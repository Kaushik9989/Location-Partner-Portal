const mongoose = require("mongoose");

const PartnerHostingRequestSchema = new mongoose.Schema({

  // ---------- PROPERTY ----------
  companyName: {
    type: String,
    required: true,
    trim: true
  },

  propertyType: {
    type: String,
    enum: ["residential", "retail", "office", "other"],
    required: true
  },

  // ---------- CONTACT ----------
  contactName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  // ---------- LOCATION MESSAGE ----------
  message: {
    type: String,
    required: true,
    trim: true
  },

  // ---------- ADMIN REVIEW FLOW ----------
  status: {
    type: String,
    enum: ["submitted", "reviewing", "approved", "rejected"],
    default: "submitted",
    index: true
  },

  adminNotes: {
    type: String,
    default: null
  },

  reviewedAt: {
    type: Date,
    default: null
  },

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "PartnerHostingRequest",
  PartnerHostingRequestSchema
);
