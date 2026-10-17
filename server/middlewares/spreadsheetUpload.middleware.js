import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

/**
 * Excel (.xlsx) or CSV uploads, parsed in memory like the CSV uploads in
 * csvUpload.middleware.js.
 */
const uploadSpreadsheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/\.(xlsx|csv)$/i.test(file.originalname || "")) {
      return cb(new ApiError(400, "Only .xlsx or .csv files are accepted"));
    }
    cb(null, true);
  },
});

/**
 * Multer wrapper that reports upload failures in the usual JSON envelope.
 * @param {string} fieldName - multipart field carrying the file
 */
export const singleSpreadsheet =
  (fieldName = "file") =>
  (req, res, next) => {
    uploadSpreadsheet.single(fieldName)(req, res, (err) => {
      if (!err) return next();
      const statusCode = err.statusCode || 400;
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large (max 2 MB)"
          : err.message || "Failed to read the uploaded file";
      return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
      });
    });
  };
