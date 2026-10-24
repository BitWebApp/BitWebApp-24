import { Router } from "express";
import {
  uploadCourseDocument,
  getAllCourseDocuments,
  getCourseDocumentFile,
  deleteCourseDocument,
} from "../controllers/courseDocument.controller.js";
import { verifyMasterAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Master Admin: Upload PDF for course and batch
router
  .route("/upload")
  .post(verifyMasterAdmin, upload.single("file"), uploadCourseDocument);

// Get all or filtered course documents (accessible to faculty & admins)
router.route("/").get(getAllCourseDocuments);

// View (inline) or download (?download=1) the PDF itself
router.route("/:id/file").get(getCourseDocumentFile);

// Master Admin: Delete document
router.route("/:id").delete(verifyMasterAdmin, deleteCourseDocument);

export default router;
