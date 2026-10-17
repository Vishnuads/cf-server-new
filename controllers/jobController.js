const mongoose = require("mongoose");
const Job = require("../models/job");
const sanitizeHtml = require("sanitize-html");

const allowedStatuses = ["Draft", "Published", "Closed"];

const sanitizeDescription = (html) => {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
};

const validateJobFields = (body) => {
  const fields = ["title", "qualification", "experience", "jd", "location"];

  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} is required`;
    }
  }

  if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
    return "Invalid job status";
  }

  return null;
};

const createJob = async (req, res) => {
  try {
    const error = validateJobFields(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const job = await Job.create({
      title: req.body.title.trim(),
      qualification: req.body.qualification.trim(),
      experience: req.body.experience.trim(),
      jd: sanitizeDescription(req.body.jd),
      location: req.body.location.trim(),
      status: req.body.status || "Draft",
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

const getPublishedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      status: "Published",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Get published jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch published jobs",
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Public visitors can only view published jobs
    // if (job.status !== "Published" && !req.user) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Job not found",
    //   });
    // }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const allowedFields = [
      "title",
      "qualification",
      "experience",
      "jd",
      "location",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // Validate the merged document, including unchanged fields
    const existingJob = await Job.findById(id);

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const mergedJob = {
      title: existingJob.title,
      qualification: existingJob.qualification,
      experience: existingJob.experience,
      jd: existingJob.jd,
      location: existingJob.location,
      status: existingJob.status,
      ...updates,
    };

    const error = validateJobFields(mergedJob);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (updates.jd !== undefined) {
      updates.jd = sanitizeDescription(updates.jd);
    }

    for (const field of ["title", "qualification", "experience", "location"]) {
      if (updates[field] !== undefined) {
        updates[field] = updates[field].trim();
      }
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getPublishedJobs,
  getJobById,
  updateJob,
  deleteJob,
};
