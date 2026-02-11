const mongoose = require("mongoose");
const TicketSchema = new mongoose.Schema({

  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocationPartner",
    required: true
  },

  type: {
    type: String,
    enum: [
      "locker_deployment",
      "locker_creation",
      "maintenance",
      "repair",
      "upgrade"
    ]
  },

  title: String,
  description: String,

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open"
  },

  relatedLocker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Locker"
  }

}, { timestamps: true });

module.exports = mongoose.model("PartnerTicket", TicketSchema);
