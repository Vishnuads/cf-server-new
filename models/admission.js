const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    dob: {
      type: Date,
      required: true,
    },

    fatherName: {
      type: String,
      required: true,
    },

    fatherNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
      enum: [
        "Direction & Screenplay",
        "Cinematography",
        "Editing & DI",
        "Stage Unreal Virtual Production",
        "Advance Virtual Production",
        "Acting",
        "Photography",
      ],
    },

    paymentOption: {
      type: String,
      required: true,
      enum: ["admission", "enrollment"],
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },

    rzp_order_id: {
      type: String,
    },

    rzp_payment_id: {
      type: String,
    },

    rzp_signature: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admission", admissionSchema);