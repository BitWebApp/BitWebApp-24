import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Award } from "../models/award.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";

const createAward = asyncHandler(async (req, res) => {
  const { title, description, date, student } = req.body;
  if (!req.file) {
    throw new ApiError(400, "File upload required");
  }

  const uploadedDocPath = await uploadOnCloudinary(req.file.path);
  if (!uploadedDocPath) {
    throw new ApiError(400, "Failed to upload file to Cloudinary");
  }

  const award = await Award.create({
    student: req.user._id,
    title,
    description,
    date,
    doc: uploadedDocPath.secure_url,
  });
  res.status(201).json({
    success: true,
    data: award,
  });
});

const getAwards = asyncHandler(async (req, res) => {
  const awards = await Award.find({ student: req.user._id }).populate("student", "fullName");

  res.status(200).json({
    success: true,
    data: awards,
  });
});

const deleteAward = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAward = await Award.findByIdAndDelete(id);

    if (!deletedAward) {
      throw new ApiError(404, "Award not found");
    }

    const docURL = deletedAward.doc;
    if (docURL) {
      try {
        const publicId = docURL.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
      }
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Error deleting Award", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getAwardById = asyncHandler(async (req, res) => {
  const award = await Award.findById(req.params.id);

  if (!award) {
    throw new ApiError(404, "Award not found");
  }

  res.status(200).json({
    success: true,
    data: award,
  });
});

const getAllAwards = asyncHandler(async (req, res) => {
  const awards = await Award.find().populate("student", "fullName");

  res.status(200).json({
    success: true,
    data: awards,
  });
});

const updateAward = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, date, student } = req.body;

  try {
    const award = await Award.findById(id);

    if (!award) {
      throw new ApiError(404, "Award not found");
    }

    award.title = title;
    award.description = description;
    award.date = date;
    award.student = student;

    const docURL = award.doc;
    if (docURL) {
      try {
        const publicId = docURL.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
      }
    }

    if (req.file) {
      const uploadedDocPath = await uploadOnCloudinary(req.file.path);
      if (!uploadedDocPath) {
        throw new ApiError(400, "Failed to upload file to Cloudinary");
      }
      award.doc = uploadedDocPath.secure_url;
    }

    await award.save();

    res.status(200).json({
      success: true,
      data: award,
    });
  } catch (error) {
    console.error("Error updating Award:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { createAward, getAwards, getAllAwards, getAwardById, updateAward, deleteAward };