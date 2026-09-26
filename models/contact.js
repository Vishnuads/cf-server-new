const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({

    name: String,
    phone: String,
    email: String,
    about: String,
    message: String,

}, { timestamps: true});

module.exports = mongoose.model("Contact", contactSchema);