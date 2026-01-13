const mongoose = require("mongoose");

const customCrmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    crmType: {
      type: String,
      enum: ["Gym", "School", "Real Estate", "Other"],
      required: true,
    },
    demoDateTime: {
      type: Date,
      required: true,
    },
    zoomLink: {
      type: String,
      required: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomCRM", customCrmSchema);
