const contact = require("../models/contact");

const createContact = async (req, res) => {
  try {
    const { name, phone, email, about, message } = req.body;

    if (!name || !phone || !email || !about || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are Required",
      });
    }

    const result = await contact.create({
      name,
      phone,
      email,
      about,
      message,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await contact.find().sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await contact.findByIdAndDelete(id);

    if (!del) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted",
      data: del,
    });
  } catch (err) {
    console.error("Delete Error:", err);
  }
};

module.exports = {
  createContact,
  getContacts,
  deleteContact,
};
