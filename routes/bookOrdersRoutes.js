const express = require("express");

const router = express.Router();

const {
  createBookOrder,
  getAllBookOrders,
  getBookOrderById,
  deleteBookOrder,
  verifyPayment,
  markPaymentFailed,
} = require("../controllers/bookOrdersController");


router.post("/create", createBookOrder);
router.get("/get", getAllBookOrders);
router.get("/get/:id", getBookOrderById);
router.delete("/delete/:id", deleteBookOrder);
router.post("/verify-payment", verifyPayment);
router.post("/payment-failed", markPaymentFailed);

module.exports = router;