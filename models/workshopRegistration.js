const mongoose = require("mongoose");

const workshopRegistrationSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    userType: {
      type: String,
      required: true,
      enum: ["Student", "Working"],
    },

    filmInterest: {
      type: String,
      required: true,
      enum: ["Yes", "No"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "-"],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkshopRegistration", workshopRegistrationSchema);