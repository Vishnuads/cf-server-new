const Workshops = require("../models/workshops");
const fs = require("fs");
const path = require("path");

const createWorkshop = async (req, res) => {
  try {
    const {
      headline,
      title,
      desc,
      points,
      fee,
      datelabel,
      date,
      location,
      status,
    } = req.body;

    // Basic validation
    if (!headline || !title) {
      return res.status(400).json({
        success: false,
        message: "Headline and Title are required",
      });
    }

    // points arrives as a JSON string from the frontend (see note below)
    let parsedPoints = [];
    if (points) {
      try {
        parsedPoints = JSON.parse(points);
      } catch {
        // fallback: if it wasn't JSON, treat as a single value or comma list
        parsedPoints = Array.isArray(points) ? points : [points];
      }
    }

    // multer puts the uploaded file info on req.file, not req.body
    const posterPath = req.file ? req.file.path : null;

    const workshop = await Workshops.create({
      headline,
      title,
      desc,
      poster: posterPath,
      points: parsedPoints,
      fee,
      datelabel,
      date,
      location,
      isActive: status === "active", // convert string -> boolean if your schema wants boolean
    });

    res.status(201).json({
      success: true,
      message: "Workshop Created Successfully",
      data: workshop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateWorkshop = async (req, res) => {
  try {
    const {
      headline,
      title,
      desc,
      points,
      fee,
      datelabel,
      date,
      location,
      status,
    } = req.body;

    // Find existing workshop
    const existingWorkshop = await Workshops.findById(req.params.id);

    if (!existingWorkshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found",
      });
    }
    // Parse points
    let parsedPoints = existingWorkshop.points;

    if (points !== undefined) {
      try {
        parsedPoints = JSON.parse(points);

        // Ensure points is an array
        if (!Array.isArray(parsedPoints)) {
          parsedPoints = [parsedPoints];
        }

        // Remove empty values
        parsedPoints = parsedPoints
          .map((point) => String(point).trim())
          .filter(Boolean);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid points format",
        });
      }
    }

    const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");

    // Keep existing poster if no new image is uploaded
    let posterPath = existingWorkshop.poster;

    if (req.file) {
      // delete old poster file before overwriting the reference
      if (
        existingWorkshop.poster &&
        typeof existingWorkshop.poster === "string"
      ) {
        const oldFullPath = path.resolve(existingWorkshop.poster);
        if (oldFullPath.startsWith(UPLOADS_DIR) && fs.existsSync(oldFullPath)) {
          fs.unlinkSync(oldFullPath);
        }
      }
      posterPath = req.file.path;
    }

    // Prepare update data
    const updateData = {
      headline,
      title,
      desc,
      points: parsedPoints,
      fee,
      datelabel,
      date,
      location,
      isActive: status === "active",
      poster: posterPath,
    };

    // Update workshop
    const updatedWorkshop = await Workshops.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Workshop updated successfully",
      data: updatedWorkshop,
    });
  } catch (error) {
    console.error("Update workshop error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkshops = async (req, res) => {
  try {
    const workshops = await Workshops.find().sort({ date : -1});
    res.status(200).json({
      data: workshops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkshopsId = async (req, res) => {
  try {
    const getID = await Workshops.findById(req.params.id);
    return res.status(200).json({ getID });
  } catch (err) {
    console.log("error", err);
  }
};

const deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshops.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found",
      });
    }

    const image = workshop.poster;

    if (image && typeof image === "string" && image.trim() !== "") {
      const fullPath = path.resolve(image);
      const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads"); // adjust to your actual folder

      if (fullPath.startsWith(UPLOADS_DIR) && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
        console.warn(`Skipping suspicious/missing path: ${fullPath}`);
      }
    }

    await Workshops.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Workshop deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  createWorkshop,
  getWorkshops,
  deleteWorkshop,
  updateWorkshop,
  getWorkshopsId,
};
