import { HigherEducation } from "../models/higher-education.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";

const createHigherEducation = asyncHandler(async (req, res) => {
  const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;
  if (!req.files || !req.files.length) {
    throw new ApiError(400, "File upload required");
  }

  const docsURL = [];
  const isDup = await HigherEducation.findOne({
    name: req.user._id,
    institution: { $regex: new RegExp(`^${institution}$`, "i") },
    degree: { $regex: new RegExp(`^${degree}$`, "i") },
  });

  if (isDup) {
    throw new Error("exam exists already!");
  }
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

  const higherEducation = await HigherEducation.create({
    name: req.user._id,
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate,
    docs: docsURL,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { higherEd: higherEducation._id },
  });

  res.status(201).json({
    success: true,
    data: higherEducation,
  });
});

const getHigherEducations = asyncHandler(async (req, res) => {
  const higherEducations = await HigherEducation.find({
    name: req.user._id,
  }).populate("name", "rollNumber fullName");

  res.status(200).json({
    success: true,
    data: higherEducations,
  });
});

const deleteHigherEducation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const higherEducation = await HigherEducation.findById(id);
  if (!higherEducation) {
    throw new ApiError(404, "Higher Education not found");
  }

  if (higherEducation.name.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this record");
  }

  const docsURL = higherEducation.docs || [];
  for (const url of docsURL) {
    try {
      const publicId = url.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
    }
  }

  await HigherEducation.findByIdAndDelete(id);
  await User.findByIdAndUpdate(higherEducation.name, {
    $pull: { higherEd: id },
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

const getHigherEducationById = asyncHandler(async (req, res) => {
  const higherEducation = await HigherEducation.findById(req.params.id);

  if (!higherEducation) {
    throw new ApiError(404, "Higher Education not found");
  }

  res.status(200).json({
    success: true,
    data: higherEducation,
  });
});

const updateHigherEducation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { institution, degree, fieldOfStudy, startDate, endDate, keepDocs } =
    req.body;

  const higherEducation = await HigherEducation.findById(id);
  if (!higherEducation) {
    throw new ApiError(404, "Higher Education not found");
  }

  if (higherEducation.name.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to edit this record");
  }

  let keepDocsList = [];
  if (keepDocs) {
    try {
      keepDocsList = Array.isArray(keepDocs)
        ? keepDocs
        : JSON.parse(keepDocs);
    } catch (error) {
      throw new ApiError(400, "Invalid keepDocs payload");
    }
  } else {
    keepDocsList = higherEducation.docs || [];
  }

  const newDocs = [];
  const existingDocs = higherEducation.docs || [];

  // Remove docs not present in keep list
  const removedDocs = existingDocs.filter(
    (docUrl) => !keepDocsList.includes(docUrl)
  );
  for (const docUrl of removedDocs) {
    const publicId = docUrl.split("/").pop().split(".")[0];
    try {
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error("Failed to delete doc:", error);
    }
  }

  // Keep remaining docs
  newDocs.push(...keepDocsList);

  // Add newly uploaded docs
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (!uploaded?.secure_url) {
        throw new ApiError(400, "Failed to upload supporting docs");
      }
      newDocs.push(uploaded.secure_url);
    }
  }

  if (!newDocs.length) {
    throw new ApiError(400, "At least one supporting document is required");
  }

  higherEducation.institution = institution || higherEducation.institution;
  higherEducation.degree = degree || higherEducation.degree;
  higherEducation.fieldOfStudy = fieldOfStudy || higherEducation.fieldOfStudy;
  higherEducation.startDate = startDate || higherEducation.startDate;
  higherEducation.endDate = endDate || higherEducation.endDate;
  higherEducation.docs = newDocs;

  await higherEducation.save();

  res.status(200).json({
    success: true,
    data: higherEducation,
  });
});

const getAllHigherEducations = asyncHandler(async (req, res) => {
  const { batch } = req.query;
  const admin = req.admin;

  if (!batch) {
    return res.status(400).json({
      success: false,
      message: "Batch is required.",
    });
  }

  const batchNumber = Number(batch);
  if (Number.isNaN(batchNumber)) {
    throw new ApiError(400, "Invalid batch query parameter");
  }

  // For batch admins, enforce access only to assigned batches
  if (admin && admin.role !== "master" && admin.assignedBatches?.length > 0) {
    if (!admin.assignedBatches.includes(batchNumber)) {
      throw new ApiError(
        403,
        `Access forbidden: You don't have access to batch K${batchNumber}`
      );
    }
  }

  const higherEducations = await HigherEducation.find().populate({
    path: "name",
    select: "rollNumber fullName batch",
    match: { batch: batchNumber },
  });

  // Filter out records where name does not match the batch
  const filteredHigherEducations = higherEducations.filter(
    (edu) => edu.name !== null
  );

  res.status(200).json({
    success: true,
    data: filteredHigherEducations,
  });
});

// const updateHigherEducation = asyncHandler(async (req, res)=>{
//   const { id } = req.params;
//   const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;

//   try {
//     const higherEducation = await HigherEducation.findById(id);

//     if (!higherEducation) {
//       throw new ApiError(404, "Higher Education not found");
//     }

//     higherEducation.institution = institution;
//     higherEducation.degree = degree;
//     higherEducation.fieldOfStudy = fieldOfStudy;
//     higherEducation.startDate = startDate;
//     higherEducation.endDate = endDate;

//     const docsURL = higherEducation.docs;
//     if (docsURL && Array.isArray(docsURL) && docsURL.length > 0) {
//       for (const url of docsURL) {
//         try {
//           const publicId = url.split("/").pop().split(".")[0];
//           await deleteFromCloudinary(publicId);
//         } catch (error) {
//           console.error("Error deleting file from Cloudinary:", error);
//         }
//       }
//     }

//     const newHigherEducationDocs = [];
//     if (req.files && req.files.length) {
//       for (const file of req.files) {
//         try {
//           const cloudinaryResponse = await uploadOnCloudinary(file.path);
//           console.log("Uploaded file to Cloudinary:", cloudinaryResponse);
//           newHigherEducationDocs.push(cloudinaryResponse.secure_url);
//         } catch (error) {
//           console.error("Error uploading file to Cloudinary:", error);
//           throw new Error("Failed to upload file to Cloudinary");
//         }
//       }
//     }

//     higherEducation.docs = newHigherEducationDocs;

//     await higherEducation.save();

//     res.status(200).json({
//       success: true,
//       data: higherEducation,
//     });
//   } catch (error) {
//     console.error("Error updating Higher Education:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

export {
  createHigherEducation,
  deleteHigherEducation,
  getAllHigherEducations,
  getHigherEducationById,
  getHigherEducations,
  updateHigherEducation,
};
