const crypto = require("crypto");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const BookOrder = require("../models/bookOrders");

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createBookOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      alternate,
      address,
      // price,
      book,
      // paymentStatus,
      // paymentID,
    } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const options = {
      amount: 299 * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    const newOrder = await BookOrder.create({
      name,
      email,
      phone,
      alternate,
      address,
      price: 299,
      book,
      rzp_order_id: order.id,
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Book order created successfully",
      order,
      dborderId: newOrder._id,
      // data: newOrder,
      key: process.env.RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("Create Book Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create book order",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { rzp_order_id, rzp_payment_id, rzp_signature, dborderId } = req.body;

    const bookOrder = await BookOrder.findById(dborderId);

    if(!bookOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    // create sign body
    const body = rzp_order_id + "|" + rzp_payment_id;

    // generate expected sign
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    // compare them
    if (expectedSign !== rzp_signature) {
      res.status(400).json({
        error: "Invalid Sign",
        success: false,
      });
    }

    await BookOrder.findByIdAndUpdate(dborderId, {
      rzp_payment_id,
      rzp_signature,
      paymentStatus: "success",
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Verification Failed" });
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    const { dborderId } = req.body;

    const updatedOrder = await BookOrder.findByIdAndUpdate(
      dborderId,
      {
        paymentStatus: "failed",
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Book order not found",
      });
    }

    res.json({
      success: true,
      message: "Payment marked as failed",
    });

  } catch (error) {
    console.error("Mark Payment Failed Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

const getAllBookOrders = async (req, res) => {
  try {
    const orders = await BookOrder.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Book Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch book orders",
      error: error.message,
    });
  }
};

const getBookOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await BookOrder.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Book order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Book Order By ID Error:", error);

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch book order",
      error: error.message,
    });
  }
};

const deleteBookOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await BookOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Book order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    console.error("Delete Book Order Error:", error);

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete book order",
      error: error.message,
    });
  }
};

module.exports = {
  createBookOrder,
  getAllBookOrders,
  getBookOrderById,
  deleteBookOrder,
  verifyPayment,
  markPaymentFailed,
};
