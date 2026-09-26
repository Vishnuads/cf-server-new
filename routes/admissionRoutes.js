const express = require("express");
const router = express.Router();

const {
    createAdmission,
    verifyPayment,
    paymentFailed,
    getAdmission,
    deleteAdmission
} = require("../controllers/admissionController");

router.post("/create", createAdmission);
router.post("/verify-payment", verifyPayment);
router.post("/failed-payment", paymentFailed);
router.get("/get", getAdmission);
router.delete("/delete/:id", deleteAdmission);

module.exports = router;