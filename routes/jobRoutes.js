const express = require("express");
const Job = require("../models/job");
const mongoose = require("mongoose");
const {
  createJob,
  getAllJobs,
  getPublishedJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const router = express.Router();

// PUBLIC ROUTES
router.get("/published", getPublishedJobs);
router.get("/published/:id", async (req, res, next) => {

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: id,
      status: "Published",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
});


router.post("/create", createJob);
router.get("/get", getAllJobs);
router.get("/get/:id", getJobById);
router.put("/update/:id", updateJob);
router.delete("/delete/:id", deleteJob);

module.exports = router;
