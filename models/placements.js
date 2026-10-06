const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    studentImage: {
      type: String, 
      default: null,
    },
    companyLogo: {
      type: String, // e.g. "/uploads/logos/xyz.png"
      default: null,
    },
    workImages: {
      type: [String], // e.g. ["/uploads/work/a.jpg", "/uploads/work/b.jpg"]
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

placementSchema.index({ department: 1, order: 1 });

module.exports = mongoose.model("Placement", placementSchema);
