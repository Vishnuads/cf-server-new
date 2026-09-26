const express = require("express");
const multer = require("multer");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventsController");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/events");
  },

  filename: (req, file, cb) => {
    const date = req.body.date || "event";
    const safeDate = date.replace(/[^a-zA-Z0-9-_]/g, "-");
    const ext = path.extname(file.originalname);

    let index = 1;
    let filename;

    do {
      filename = `${safeDate}_${index}${ext}`;
      index++;
    } while (fs.existsSync(path.join("uploads/events", filename)));

    cb(null, filename);
  },
});
  
// Multer configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});  

router.post("/create", upload.array("images", 5), createEvent);
router.get("/get", getEvents);
router.get("/get/:id", getEventById);
router.delete("/delete/:id", deleteEvent);
router.put("/update/:id", upload.array("images", 5),updateEvent);

module.exports = router;  
