import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { Readable } from "stream";
import { CourseDocument } from "../models/courseDocument.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  getSignedDownloadUrl,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import { uploadsDir } from "../utils/storagePaths.js";

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

/**
 * `Content-Disposition` value that keeps non-ASCII file names intact.
 * @param {"inline"|"attachment"} type
 * @param {string} fileName
 */
const contentDisposition = (type, fileName) => {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

/**
 * Name of the file in the local uploads folder when the document was stored
 * on this server (pdfUrl "/uploads/<name>" or "<BASE_URL>/uploads/<name>"),
 * otherwise null. Read as plain text: stored names may contain characters
 * such as "#" that a URL parser would cut off.
 */
const localUploadName = (pdfUrl = "") => {
  const base = (process.env.BASE_URL || process.env.SERVER_URL || "").replace(
    /\/+$/g,
    ""
  );
  const relative =
    base && pdfUrl.startsWith(base) ? pdfUrl.slice(base.length) : pdfUrl;
  return relative.startsWith("/uploads/")
    ? path.basename(relative.slice("/uploads/".length))
    : null;
};

/**
 * GET /api/v1/course-docs/:id/file[?download=1]
 *
 * Serves a course document PDF from this app's own address, opened in the
 * browser or (with download=1) saved as a file. Going through the API
 * instead of linking pdfUrl directly means:
 * - file names with "#", "?" or "%" still work,
 * - "Download" works for files on Cloudinary (browsers ignore the download
 *   attribute on links to another site),
 * - PDFs still open when the Cloudinary account blocks public PDF delivery,
 *   by falling back to a signed download link.
 */
const getCourseDocumentFile = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid document id");
  }
  const doc = await CourseDocument.findById(req.params.id);
  if (!doc) throw new ApiError(404, "Course document not found");

  const download = ["1", "true"].includes(String(req.query.download));
  const fileName = doc.originalFileName || `${doc.course} - ${doc.batch}.pdf`;
  // Only once the file is found, so error replies stay plain JSON.
  const setPdfHeaders = () => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      contentDisposition(download ? "attachment" : "inline", fileName)
    );
    res.setHeader("Cache-Control", "private, max-age=300");
  };

  const localName = localUploadName(doc.pdfUrl);
  if (localName) {
    const filePath = path.join(uploadsDir, localName);
    if (!fs.existsSync(filePath)) {
      throw new ApiError(
        404,
        "This PDF is no longer on the server. Please ask the master admin to upload it again."
      );
    }
    setPdfHeaders();
    return res.sendFile(filePath);
  }

  let upstream = await fetch(doc.pdfUrl);
  if (!upstream.ok) {
    const signedUrl = getSignedDownloadUrl(doc.pdfUrl, doc.publicId);
    if (signedUrl) upstream = await fetch(signedUrl);
  }
  if (!upstream.ok || !upstream.body) {
    throw new ApiError(
      502,
      `Could not load the PDF from file storage (HTTP ${upstream.status})`
    );
  }
  setPdfHeaders();
  const length = upstream.headers.get("content-length");
  if (length) res.setHeader("Content-Length", length);
  Readable.fromWeb(upstream.body).pipe(res);
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
  getCourseDocumentFile,
  deleteCourseDocument,
};
