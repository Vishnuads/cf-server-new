const Events = require("../models/events");
const fs = require("fs");
const path = require("path");

const createEvent = async (req, res) => {
  try {
    const { date, displayDate, title, tagline, highlights, location } =
      req.body;

    // Validate required fields
    if (!date || !title || !tagline || !location) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Parse highlights
    let parsedHighlights = [];

    if (highlights) {
      try {
        parsedHighlights = JSON.parse(highlights);

        if (!Array.isArray(parsedHighlights)) {
          return res.status(400).json({
            success: false,
            message: "Highlights must be an array",
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid highlights format",
        });
      }
    }

    // Get uploaded images
    const images = req.files ? req.files.map((file) => file.path) : [];

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Create event
    const event = await Events.create({
      date,
      displayDate,
      title,
      tagline,
      highlights: parsedHighlights,
      location,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Events.find().sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const existingEvent = await Events.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const {
      date,
      displayDate,
      title,
      tagline,
      highlights,
      location,
      removeImages,
    } = req.body;

    // Parse highlights
    let parsedHighlights = existingEvent.highlights;

    if (highlights !== undefined) {
      try {
        parsedHighlights = JSON.parse(highlights);

        if (!Array.isArray(parsedHighlights)) {
          return res.status(400).json({
            success: false,
            message: "Highlights must be an array",
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid highlights format",
        });
      }
    }

    // Existing images
    let existingImages = [...existingEvent.images];

    // Remove selected images
    if (removeImages !== undefined) {
      let imagesToRemove = [];

      try {
        imagesToRemove = JSON.parse(removeImages);

        if (!Array.isArray(imagesToRemove)) {
          return res.status(400).json({
            success: false,
            message: "Invalid removeImages format",
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid removeImages JSON",
        });
      }

      // Delete selected image files
      for (const image of imagesToRemove) {
        if (!existingImages.includes(image)) continue;

        const fullPath = path.resolve(image);

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      // Remove from database array
      existingImages = existingImages.filter(
        (image) => !imagesToRemove.includes(image),
      );
    }

    // Add new uploaded images
    const newImages = req.files ? req.files.map((file) => file.path) : [];

    const finalImages = [...existingImages, ...newImages];

    if (finalImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Prepare update
    const updateData = {
      date,
      displayDate,
      title,
      tagline,
      highlights: parsedHighlights,
      location,
      images: finalImages,
    };

    // Update database
    const updatedEvent = await Events.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Delete associated images
    for (const image of event.images) {
      const fullPath = path.resolve(image);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Delete event
    await Events.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
