const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    points: {
      type: [String],
      required: true,
    },

    fee: {
      type: String,
    },

    poster: {
      type: String,
      required: true,
    },

    datelabel: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },
    
    location : {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
); 

module.exports = mongoose.model("Workshops", workshopSchema);