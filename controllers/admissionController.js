const admission = require("../models/admission");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const paymentAmounts = {
  admission: 45000,
  enrollment: 5000,
};

const createAdmission = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      age,
      gender,
      dob,
      fatherName,
      fatherNumber,
      address,
      city,
      state,
      country,
      course,
      paymentOption,
    } = req.body;

    if (!fullName || !email || !phone || !address || !course) {
      return res.status(400).json({
        success: false,
      });
    }
    const amount = paymentAmounts[paymentOption];

    const result = await admission.create({
      fullName,
      email,
      phone,
      age,
      gender,
      dob,
      fatherName,
      fatherNumber,
      address,
      city,
      state,
      country,
      course,
      paymentOption,
      amount,
      paymentStatus: "Pending",
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: `admission_${result._id}`,
        notes: {
          admissionID: result._id.toString(),
          fullName,
          phone,
          course,
          paymentOption,
        },
      });

      result.rzp_order_id = razorpayOrder.id;

      await result.save();

      return res.status(201).json({
        success: true,
        message: "Application & Payment received ",
        data: {
          admissionID: result._id,
          fullName: result.fullName,
          email: result.email,
          phone: result.phone,
          amount: amount,
          currency: "INR",
          paymentStatus: result.paymentStatus,
          rzp_order_id: razorpayOrder.id,
          rzp_key_id: process.env.RAZORPAY_KEY,
        },
      });
    } catch (rzp_err) {
      console.log("error", rzp_err);

      return res.status(500).json({
        success: false,
        message: "Application saved but payment failed",
        admissionID: result._id,
        paymentStatus: result.paymentStatus,
      });
    }
  } catch (err) {
    console.log("Error", err);

    return res.status(500).json({
      success: false,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      admissionId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!admissionId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
      });
    }

    const result = await admission.findById(admissionId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Application not found",
      });
    }

    if (result.rzp_order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID does not match this application",
      });
    }

    // expected sign
    const genSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // compare signs
    if (genSign !== razorpay_signature) {
      result.paymentStatus = "Failed";
      await result.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        paymentStatus: "Failed",
      });
    }

    result.rzp_payment_id = razorpay_payment_id;
    result.rzp_signature = razorpay_signature;
    result.paymentStatus = "Success";

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Payment Verified successfully",
      data: {
        admissionID: result._id,
        paymentStatus: result.paymentStatus,
        rzp_payment_id: result.rzp_payment_id,
      },
    });
  } catch (err) {
    console.log("Verification error", err);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

const paymentFailed = async (req, res) => {
  try {
    const { admissionId, errorCode, errorDescription } = req.body;

    if (!admissionId) {
      return res.status(400).json({
        success: false,
        message: "Admission ID is required",
      });
    }

    const result = await admission.findById(admissionId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Do not overwrite a successful payment
    if (result.paymentStatus === "Success") {
      return res.status(400).json({
        success: false,
        message: "Payment is already successful",
      });
    }

    result.paymentStatus = "Failed";

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      paymentStatus: result.paymentStatus,
    });
  } catch (error) {
    console.error("Payment failed update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

const getAdmission = async (req, res) => {
  try {
    const admissions = await admission.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: admissions,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params
    const del = await admission.findByIdAndDelete(id);
    if (!del) {
      return res.status(404).json({
        success: false,
        message: "Delete admission failed",
      });
    }
     return res.status(200).json({
        success: true,
        message: "Admission data deleted successfully",
        data: del
      });
  } catch (err) {
    console.log("Error", err);
    alert("Failed to delete");
  }
};

module.exports = {
  createAdmission,
  verifyPayment,
  paymentFailed,
  deleteAdmission,
  getAdmission,
};
