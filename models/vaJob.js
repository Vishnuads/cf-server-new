
const mongoose = require("mongoose");

// VishnuAds jobs
const vaJobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    jd: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],  
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VaJob", vaJobSchema);
