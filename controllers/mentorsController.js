const Mentors = require("../models/mentors");
const Department = require("../models/departments");
const fs = require("fs");
const path = require("path");

const createMentor = async (req, res) => {
  try {
    const { name, role, desc, course, type } = req.body;

    const imgPath = req.file ? req.file.path : null;

    const mentor = await Mentors.create({
      name,
      role,
      desc,
      course : course || null,
      type,
      image: imgPath,
    });

    res.status(201).json({
      success: true,
      messade: "Mentors added successfully",
      data: mentor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateMentor = async (req, res) => {
  try {
    const { name, role, desc, course, type } = req.body;

    const existing = await Mentors.findById(req.params.id);

    const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");

    let imgPath = existing.image;

    if (req.file) {
      if (existing.image && typeof existing.image === "string") {
        const oldImg = path.resolve(existing.image);
        if (oldImg.startsWith(UPLOADS_DIR) && fs.existsSync(oldImg)) {
          fs.unlinkSync(oldImg);
        }
      }
      imgPath = req.file.path;
    }

    if(course){
      const courseId = await Department.findById(course);
      if(!courseId){
        return res.status(400).json({
          success: false,
          message: "Invalid Course Id"
        })
      }
      existing.course = course;
    }
                                  
    const data = { name, role, desc, course: course || null, type, image: imgPath };
    const updated = await Mentors.findByIdAndUpdate(req.params.id, data);

    return res.status(200).json({
      success: true,
      message: "Mentor updated successfully",
      data: updated,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMentors = async (req, res) => {
  try {
    const mentor = await Mentors.find().populate("course", "name");

    return res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMentorsId = async (req, res) => {
  try {
    const getID = await Mentors.findById(req.params.id).populate("course", "name");
    return res.status(200).json({
      data: getID,
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteMentor = async (req, res) => {
  try {
    await Mentors.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Mentor deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
    createMentor,
    updateMentor,
    getMentors,
    getMentorsId,
    deleteMentor,
}