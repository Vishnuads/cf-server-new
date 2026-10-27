const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createApplication,
  getApplications,
  getApplicationById,
  deleteApplication,
  updateApplicationStatus,
} = require("../controllers/vaApplicationController");

const router = express.Router();

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "vishnuads"
);

// Create upload directory if it doesn't exist
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // const uniqueName =
    //   path.extname(file.originalname).toLowerCase();

    // cb(null, uniqueName);
     cb(null, path.basename(file.originalname));
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      return cb(null, true);
    }
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  },
});

router.post("/create", upload.single("resume"), createApplication);
router.get("/get", getApplications);
router.get("/get/:id", getApplicationById);
router.delete("/delete/:id", deleteApplication);
router.put("/status/:id", updateApplicationStatus);
// Handle Multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Resume must be under 5 MB"
          : err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
});

module.exports = router;
