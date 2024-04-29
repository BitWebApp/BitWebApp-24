import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Exam } from "../models/exam.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const createExam = asyncHandler(async (req, res) => {
  const { examRoll, examName, isSelected, score } = req.body;

  if (!req.files || !req.files.length) {
    throw new ApiError(400, "File upload required");
  }

  const docsURL = [];

  for (const file of req.files) {
    try {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);
      console.log("Uploaded file to Cloudinary:", cloudinaryResponse);
      docsURL.push(cloudinaryResponse.secure_url);
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }

  const exam = await Exam.create({
    examRoll,
    examName,
    docs: docsURL,
    isSelected,
    score,
  });

  res.status(201).json({
    success: true,
    data: exam,
  });
});
const updateExam = asyncHandler(async (req, res) => {
  const { examRoll, examName, isSelected, score } = req.body;
  const { id } = req.params;

  try {
    let exam = await Exam.findById(id);

    if (!exam) {
      throw new ApiError(404, "Exam not found");
    }

    // Update fields
    exam.examRoll = examRoll;
    exam.examName = examName;
    exam.isSelected = isSelected;
    exam.score = score;

    await exam.save();

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

import { deleteFromCloudinary } from "../utils/Cloudinary.js";

const deleteExam = asyncHandler(async (req, res) => {
  const deletedExam = await Exam.findByIdAndDelete(req.params.id);

  if (!deletedExam) {
    throw new ApiError(404, "Exam not found");
  }

  const docsURL = deletedExam.docs;
  if (docsURL && Array.isArray(docsURL) && docsURL.length > 0) {
    for (const url of docsURL) {
      try {
        const publicId = url.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find();

  res.status(200).json({
    success: true,
    data: exams,
  });
});

const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  res.status(200).json({
    success: true,
    data: exam,
  });
});

export { createExam, getExams, getExamById, updateExam, deleteExam };
