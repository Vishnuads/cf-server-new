const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload folders exist
const folders = ["uploads/students", "uploads/logos", "uploads/work"];
folders.forEach((folder) => {
  const fullPath = path.join(__dirname, "..", folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Decide destination folder based on field name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others";
    if (file.fieldname === "studentImage") folder = "uploads/students";
    else if (file.fieldname === "companyLogo") folder = "uploads/logos";
    else if (file.fieldname === "workImages") folder = "uploads/work";

    cb(null, path.join(__dirname, "..", folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// Allow only image types
const allowedTypes = /jpeg|jpg|png|webp|avif/;
const fileFilter = (req, file, cb) => {
  const extValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp, avif) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

// Fields used when creating/updating a placement
const placementUpload = upload.fields([
  { name: "studentImage", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },
  { name: "workImages", maxCount: 5 },
]);

module.exports = { upload, placementUpload };
