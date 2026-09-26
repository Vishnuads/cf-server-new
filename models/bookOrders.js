const mongoose = require("mongoose");

const bookOrderSchema = new mongoose.Schema(
  {
    name: {
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

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternate: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    book: {
      type: String,
      required: true,
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    rzp_payment_id: {
      type: String,
    },

    rzp_order_id: {
      type: String,
    },

    rzp_signature: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const BookOrder = mongoose.model("BookOrder", bookOrderSchema);

module.exports = BookOrder;
