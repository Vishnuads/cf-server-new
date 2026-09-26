const express = require("express");
const router = express.Router();
const {
    createWorkshopRegistration,
    verifyWorkshopPayment,
    updateWorkshopPaymentFailed,
    getAllWorkshopRegistrations,
    getWorkshopRegistrationById,
    deleteWorkshopRegistration,
} = require("../controllers/workshopRegistrationController");

router.post("/create", createWorkshopRegistration);
router.post("/verify-payment", verifyWorkshopPayment);
router.post("/failed-payment", updateWorkshopPaymentFailed);
router.get("/get", getAllWorkshopRegistrations);
router.get("/get/:id", getWorkshopRegistrationById);
router.delete("/delete/:id", deleteWorkshopRegistration);

module.exports = router;