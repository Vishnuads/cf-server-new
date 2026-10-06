const express = require("express");
const multer = require("multer");
const {
  createMentor,
  updateMentor,
  getMentors,
  getMentorsId,
  deleteMentor,
} = require("../controllers/mentorsController");
const path = require("path")

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/mentors");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueName + extension);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Image files only"));
    }
  },
});

router.post("/create", upload.single("image"), createMentor);
router.get("/get", getMentors);
router.get("/get/:id", getMentorsId);
router.put("/update/:id",upload.single("image"), updateMentor);
router.delete("/delete/:id", deleteMentor);

module.exports = router;
