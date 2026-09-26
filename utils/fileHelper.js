const fs = require("fs");
const path = require("path");

/**
 * Deletes a file given its stored relative path, e.g. "/uploads/students/xyz.jpg"
 * Fails silently if the file doesn't exist.
 */
const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, "..", relativePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error(`Failed to delete file: ${fullPath}`, err.message);
    }
  });
};

/**
 * Deletes multiple files (array of relative paths).
 */
const deleteFiles = (relativePaths = []) => {
  relativePaths.forEach((p) => deleteFile(p));
};

module.exports = { deleteFile, deleteFiles };
