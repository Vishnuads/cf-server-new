const dotenv = require("dotenv");
const WorkshopRegistration = require("../models/workshopRegistration");
const crypto = require("crypto");
const Razorpay = require("razorpay");

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createWorkshopRegistration = async (req, res) => {
  try {
    const {
      title,
      name,
      phone,
      email,
      amount,
      location,
      userType,
      filmInterest,
    } = req.body;

    // Validation
    if (!name || !phone || !email || !location || !userType || !filmInterest) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate amount (0 is allowed now, only negative/invalid is rejected)
    const workshopAmount = Number(amount);

    if (!Number.isFinite(workshopAmount) || workshopAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // FREE WORKSHOP - skip Razorpay entirely
    if (workshopAmount === 0) {
      const registration = await WorkshopRegistration.create({
        title,
        name,
        phone,
        email,
        amount: workshopAmount,
        location,
        userType,
        filmInterest,
        paymentStatus: "-",
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful. No payment required.",
        data: {
          registrationId: registration._id,
          amount: 0,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          title: registration.title,
          isFree: true,
        },
      });
    }

    // PAID WORKSHOP - existing flow
    const amountInPaise = Math.round(workshopAmount * 100);

    const registration = await WorkshopRegistration.create({
      title,
      name,
      phone,
      email,
      amount: workshopAmount,
      location,
      userType,
      filmInterest,
      paymentStatus: "pending",
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `workshop_${Date.now()}`,
      });

      registration.razorpayOrderId = razorpayOrder.id;
      await registration.save();

      return res.status(201).json({
        success: true,
        message: "Registration created. Proceed to payment.",
        data: {
          registrationId: registration._id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          title: registration.title,
          isFree: false,
        },
      });
    } catch (err) {
      console.log("error", err);
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
      });
    }
  } catch (error) {
    console.error("Create Workshop Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create registration",
    });
  }
};

const verifyWorkshopPayment = async (req, res) => {
  try {
    const {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !registrationId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // Find registration
    const registration = await WorkshopRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Ensure order matches our registration
    if (registration.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID mismatch",
      });
    }

    // Prevent unnecessary duplicate processing
    if (registration.paymentStatus === "success") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: registration,
      });
    }

    // Generate signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update payment status
    registration.paymentStatus = "success";

    registration.razorpayPaymentId = razorpay_payment_id;

    registration.razorpaySignature = razorpay_signature;

    await registration.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Verify Workshop Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

const updateWorkshopPaymentFailed = async (req, res) => {
  try {
    const { registrationId, razorpay_payment_id } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required",
      });
    }

    const registration = await WorkshopRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Don't overwrite a successful payment
    if (registration.paymentStatus === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment is already successful",
      });
    }

    registration.paymentStatus = "failed";

    if (razorpay_payment_id) {
      registration.razorpayPaymentId = razorpay_payment_id;
    }

    await registration.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      data: registration,
    });
  } catch (error) {
    console.error("Failed Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

const getAllWorkshopRegistrations = async (req, res) => {
  try {
    const registrations = await WorkshopRegistration.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
};

const getWorkshopRegistrationById = async (req, res) => {
  try {
    const registration = await WorkshopRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registration",
    });
  }
};

const deleteWorkshopRegistration = async (req, res) => {
  try {
    const registration = await WorkshopRegistration.findByIdAndDelete(
      req.params.id,
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete registration",
    });
  }
};

module.exports = {
  createWorkshopRegistration,
  verifyWorkshopPayment,
  updateWorkshopPaymentFailed,
  getAllWorkshopRegistrations,
  getWorkshopRegistrationById,
  deleteWorkshopRegistration,
};
