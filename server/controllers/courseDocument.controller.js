import { CourseDocument } from "../models/courseDocument.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";

const VALID_COURSES = [
  "MCA Minor Project",
  "MCA Major Project",
  "MTech Thesis 1",
  "MTech Thesis 2",
];

const VALID_BATCHES = ["K22", "K23", "K24", "K25", "K26"];

// Master admin only: upload or replace a PDF for a particular course and batch
const uploadCourseDocument = asyncHandler(async (req, res) => {
  const { course, batch } = req.body;

  if (!course || !VALID_COURSES.includes(course)) {
    throw new ApiError(
      400,
      `Invalid course. Allowed courses are: ${VALID_COURSES.join(", ")}`
    );
  }

  if (!batch || !VALID_BATCHES.includes(batch)) {
    throw new ApiError(
      400,
      `Invalid batch. Allowed batches are: ${VALID_BATCHES.join(", ")}`
    );
  }

  if (!req.file) {
    throw new ApiError(400, "Please provide a PDF file to upload");
  }

  const isPdf =
    req.file.mimetype === "application/pdf" ||
    req.file.originalname?.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new ApiError(400, "Only PDF files are supported");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  if (!uploadResult || !uploadResult.url) {
    throw new ApiError(500, "Failed to store uploaded PDF file");
  }

  // If replacing an existing document, delete the old file to save disk space
  const existingDoc = await CourseDocument.findOne({ course, batch });
  if (existingDoc && existingDoc.publicId) {
    try {
      await deleteFromCloudinary(existingDoc.publicId);
    } catch (delErr) {
      console.warn("Could not delete previous file:", delErr?.message);
    }
  }

  const courseDoc = await CourseDocument.findOneAndUpdate(
    { course, batch },
    {
      course,
      batch,
      pdfUrl: uploadResult.url || uploadResult.secure_url,
      originalFileName: req.file.originalname,
      publicId: uploadResult.public_id || "",
      fileSize: req.file.size || 0,
      uploadedBy: req.admin?._id,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, courseDoc, "Course document PDF uploaded successfully")
  );
});

// Fetch all uploaded course documents (accessible to faculty and admin)
const getAllCourseDocuments = asyncHandler(async (req, res) => {
  const { course, batch } = req.query;
  const filter = {};
  if (course && VALID_COURSES.includes(course)) {
    filter.course = course;
  }
  if (batch && VALID_BATCHES.includes(batch)) {
    filter.batch = batch;
  }

  const docs = await CourseDocument.find(filter)
    .populate("uploadedBy", "username email")
    .sort({ course: 1, batch: 1 });

  return res.status(200).json(
    new ApiResponse(200, docs, "Course documents retrieved successfully")
  );
});

// Delete a document (Master admin only)
const deleteCourseDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await CourseDocument.findById(id);

  if (!doc) {
    throw new ApiError(404, "Course document not found");
  }

  if (doc.publicId) {
    try {
      await deleteFromCloudinary(doc.publicId);
    } catch (delErr) {
      console.warn("Could not delete file from storage:", delErr?.message);
    }
  }

  await CourseDocument.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, null, "Course document deleted successfully")
  );
});

export {
  uploadCourseDocument,
  getAllCourseDocuments,
  deleteCourseDocument,
};
