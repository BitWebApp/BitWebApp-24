import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { HigherEducation } from "../models/higher-education.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const createHigherEducation = asyncHandler(async (req, res) => {
  const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;

  if (!req.files || !req.files.length) {
    throw new ApiError(400, "File upload required");
  }

  const docURLs = [];

  for (const file of req.files) {
    try {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);
      console.log("Uploaded file to Cloudinary:", cloudinaryResponse);
      docURLs.push(cloudinaryResponse.secure_url);
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }

  const higherEducation = await HigherEducation.create({
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    docs: docURLs,
  });

  res.status(201).json({
    success: true,
    data: higherEducation,
  });
});

const updateHigherEducation = asyncHandler(async (req, res) => {
  const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;
  const { id } = req.params;

  try {
    let higherEducation = await HigherEducation.findById(id);

    if (!higherEducation) {
      throw new ApiError(404, "Higher education record not found");
    }

    higherEducation.institution = institution;
    higherEducation.degree = degree;
    higherEducation.fieldOfStudy = fieldOfStudy;
    higherEducation.startDate = startDate;
    higherEducation.endDate = endDate;

    await higherEducation.save();

    res.status(200).json({
      success: true,
      data: higherEducation,
    });
  } catch (error) {
    console.error("Error updating higher education record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const deleteHigherEducation = asyncHandler(async (req, res) => {
  const deletedHigherEducation = await HigherEducation.findByIdAndDelete(req.params.id);

  if (!deletedHigherEducation) {
    throw new ApiError(404, "Higher education record not found");
  }

  const docURLs = deletedHigherEducation.docs;
  if (docURLs && Array.isArray(docURLs) && docURLs.length > 0) {
    for (const url of docURLs) {
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

const getHigherEducations = asyncHandler(async (req, res) => {
  const higherEducations = await HigherEducation.find();

  res.status(200).json({
    success: true,
    data: higherEducations,
  });
});

const getHigherEducationById = asyncHandler(async (req, res) => {
  const higherEducation = await HigherEducation.findById(req.params.id);

  if (!higherEducation) {
    throw new ApiError(404, "Higher education record not found");
  }

  res.status(200).json({
    success: true,
    data: higherEducation,
  });
});

export { createHigherEducation, getHigherEducations, getHigherEducationById, updateHigherEducation, deleteHigherEducation };
