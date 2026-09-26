const express = require("express")
const {
    createContact, getContacts, deleteContact
} = require("../controllers/contactController")

const router = express.Router();

router.post("/create", createContact);
router.get("/get", getContacts);
router.delete("/delete/:id", deleteContact);

module.exports = router;

