const express = require("express");
const multer = require("multer");
const path = require("path")
const { createWorkshop, getWorkshops, deleteWorkshop, updateWorkshop, getWorkshopsId,freeRegistration } = require("../controllers/workshopController");

const router = express.Router();

// Configure where/how uploaded files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/workshops"); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }, 
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit, adjust as needed
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/create", upload.single("poster"), createWorkshop);
router.get("/get/:id",  getWorkshopsId)
router.get("/get", getWorkshops);
router.delete("/delete/:id", deleteWorkshop);
router.put("/update/:id", upload.single("poster"), updateWorkshop);

module.exports = router;
