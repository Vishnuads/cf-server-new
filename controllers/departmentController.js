const mongoose = require("mongoose");
const Department = require("../models/departments");
const Placement = require("../models/placements");
const { deleteFile, deleteFiles } = require("../utils/fileHelper");

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, slug, order } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Department name is required" });
    }

    const department = await Department.create({ name, slug, order });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateDepartment = async (req, res) => {
  try {
    const { name, slug, order } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    if (name) department.name = name;
    if (slug) department.slug = slug;
    if (order !== undefined) department.order = order;

    await department.save();
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const department = await Department.findById(req.params.id).session(
      session,
    );
    if (!department) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Find all placements under this department to clean up their files
    const placements = await Placement.find({
      department: department._id,
    }).session(session);

    placements.forEach((p) => {
      deleteFile(p.studentImage);
      deleteFile(p.companyLogo);
      deleteFiles(p.workImages);
    });

    await Placement.deleteMany({ department: department._id }).session(session);
    await Department.deleteOne({ _id: department._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Department and ${placements.length} associated placement(s) deleted`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
