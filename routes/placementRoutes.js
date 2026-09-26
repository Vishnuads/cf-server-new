const express = require("express");
const { placementUpload } = require("../middleware/upload");
const {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacementStats,
} = require("../controllers/placementController");

const router = express.Router();

router.post("/create", placementUpload, createPlacement);
router.get("/get", getPlacements);
router.get("/get/:id", getPlacementById);
router.put("/update/:id", placementUpload, updatePlacement);
router.delete("/delete/:id", deletePlacement);
router.get("/stats", getPlacementStats);

module.exports = router;
