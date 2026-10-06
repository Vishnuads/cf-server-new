const mongoose = require("mongoose");

const mentorsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    desc: {
      type: String,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Mentor", "Advisory Board"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mentors", mentorsSchema);
