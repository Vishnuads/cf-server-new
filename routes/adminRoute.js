const express = require("express");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid Credenials" });

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ success: true,token });
});

module.exports = router;