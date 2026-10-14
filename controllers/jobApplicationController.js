const Application = require("../models/jobApplication");
const fs = require("fs/promises");
const path = require("path");

// CREATE application
exports.createApplication = async (req, res) => {
  try {
    const { name, phone, email, role } = req.body;

    if (!name || !phone || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume",
      });
    }

    const application = await Application.create({
      name,
      phone,
      email,
      role,
      resume: `uploads/resumes/${req.file.filename}`,
      resumeOriginalName: req.file.originalname,
      resumeMimeType: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    // Remove uploaded file if saving fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    console.error("Create application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};

// UPDATE application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
      "Pending",
      "Reviewed",
      "Shortlisted",
      "Rejected",
    ];

    // Validate status
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        allowedStatuses,
      });
    }

    // Find application and update status
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    console.error("Update application status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};

// GET all applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// GET single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });

  } catch (error) {

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

// DELETE application by ID
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Delete the resume from the server
    const resumePath = path.resolve(process.cwd(), application.resume);

    await fs.unlink(resumePath).catch((error) => {
      if (error.code !== "ENOENT") {
        console.error("Resume deletion error:", error);
      }
    });

    await Application.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete application",
    });
  }
};
