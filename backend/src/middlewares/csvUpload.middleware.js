import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/octet-stream",
];

/**
 * CSV uploads are parsed in-process, so they are kept in memory instead of
 * being written to disk like the Cloudinary uploads elsewhere in the app.
 */
const uploadCSV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isCsvName = /\.csv$/i.test(file.originalname || "");
    if (!isCsvName || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only .csv files are accepted"));
    }
    cb(null, true);
  },
});

/**
 * Multer wrapper that reports upload failures (wrong type, file too large) in
 * the same JSON envelope the rest of the API uses, since this app has no
 * global express error handler mounted.
 * @param {string} fieldName - multipart field carrying the CSV
 */
export const singleCSV =
  (fieldName = "file") =>
  (req, res, next) => {
    uploadCSV.single(fieldName)(req, res, (err) => {
      if (!err) return next();
      const statusCode = err.statusCode || 400;
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "CSV file is too large (max 2 MB)"
          : err.message || "Failed to read the uploaded file";
      return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
      });
    });
  };
