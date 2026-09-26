const Placement = require("../models/placements");
const Department = require("../models/departments");
const { deleteFile, deleteFiles } = require("../utils/fileHelper");

const buildPath = (file) => {
  if (!file) return null;
  // file.path looks like: <root>/uploads/students/xyz.jpg
  const idx = file.path.replace(/\\/g, "/").indexOf("uploads/");
  return "/" + file.path.replace(/\\/g, "/").slice(idx);
};

const getPlacements = async (req, res) => {
  try {
    const { department, isActive } = req.query;
    const filter = {};

    if (department) {
      const dept = await Department.findOne({ slug: department });
      if (!dept) {
        return res.status(200).json({ success: true, data: [] });
      }
      filter.department = dept._id;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const placements = await Placement.find(filter)
      .populate("department", "name slug")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: placements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlacementById = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id).populate(
      "department",
      "name slug",
    );
    if (!placement) {
      return res
        .status(404)
        .json({ success: false, message: "Placement not found" });
    }
    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlacement = async (req, res) => {
  try {
    const { name, role, company, note, type, department, order, isActive } =
      req.body;

    if (!name || !role || !company || !department) {
      return res.status(400).json({
        success: false,
        message: "name, role, company and department are required",
      });
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid department id" });
    }

    const studentImage = req.files?.studentImage?.[0]
      ? buildPath(req.files.studentImage[0])
      : null;
    const companyLogo = req.files?.companyLogo?.[0]
      ? buildPath(req.files.companyLogo[0])
      : null;
    const workImages = (req.files?.workImages || []).map(buildPath);

    const placement = await Placement.create({
      name,
      role,
      company,
      note,
      type,
      department,
      order,
      isActive: isActive === "true",
      studentImage,
      companyLogo,
      workImages,
    });

    res.status(201).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePlacement = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res
        .status(404)
        .json({ success: false, message: "Placement not found" });
    }

    const {
      name,
      role,
      company,
      note,
      type,
      department,
      order,
      isActive,
      removeWorkImages,
    } = req.body;

    if (department) {
      const deptDoc = await Department.findById(department);
      if (!deptDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid department id" });
      }
      placement.department = department;
    }

    if (name !== undefined) placement.name = name;
    if (role !== undefined) placement.role = role;
    if (company !== undefined) placement.company = company;
    if (note !== undefined) placement.note = note;
    if (type !== undefined) placement.type = type;
    // if (order !== undefined) placement.order = order;
    if (order !== undefined) {
      placement.order = Number(order) || 0;
    }
    // if (isActive !== undefined) placement.isActive = isActive;
    if (isActive !== undefined) {
      placement.isActive = isActive === "true";
    }
    // Replace studentImage if a new one was uploaded
    if (req.files?.studentImage?.[0]) {
      deleteFile(placement.studentImage);
      placement.studentImage = buildPath(req.files.studentImage[0]);
    }

    // Replace companyLogo if a new one was uploaded
    if (req.files?.companyLogo?.[0]) {
      deleteFile(placement.companyLogo);
      placement.companyLogo = buildPath(req.files.companyLogo[0]);
    }

    // Remove specific work images if requested
    if (removeWorkImages) {
      let toRemove = [];
      try {
        toRemove = JSON.parse(removeWorkImages);
      } catch {
        toRemove = [removeWorkImages];
      }
      deleteFiles(toRemove);
      placement.workImages = placement.workImages.filter(
        (img) => !toRemove.includes(img),
      );
    }

    // Append any newly uploaded work images
    // if (req.files?.workImages?.length) {
    //   const newImages = req.files.workImages.map(buildPath);
    //   placement.workImages = [...placement.workImages, ...newImages];
    // }
      if (req.files?.workImages?.length) {
      const MAX_WORK_IMAGES = 5;
      const newImages = req.files.workImages.map(buildPath);
 
      if (newImages.length > MAX_WORK_IMAGES) {
        deleteFiles(newImages); // nothing references these, clean them up
        return res.status(400).json({
          success: false,
          message: `You can upload at most ${MAX_WORK_IMAGES} work images.`,
        });
      }
 
      deleteFiles(placement.workImages); // remove the old files from disk
      placement.workImages = newImages;
    }

    await placement.save();
    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res
        .status(404)
        .json({ success: false, message: "Placement not found" });
    }

    deleteFile(placement.studentImage);
    deleteFile(placement.companyLogo);
    deleteFiles(placement.workImages);

    await Placement.deleteOne({ _id: placement._id });

    res
      .status(200)
      .json({ success: true, message: "Placement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlacementStats = async (req, res) => {
  try {
    const totalStudents = await Placement.countDocuments({ isActive: true });
    const totalDepartments = await Department.countDocuments();
    const companies = await Placement.distinct("company", { isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalDepartments,
        totalCompanies: companies.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacementStats,
};
