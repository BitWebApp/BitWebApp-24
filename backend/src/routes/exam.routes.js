import { Router } from "express";
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} from "../controllers/exam.controller.js";
// import { uploadMultiple } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.post("/", verifyJWT, uploadMultiple, createExam);
router.get("/", verifyJWT, getExams);
router.get("/:id", verifyJWT, getExamById);
router.put("/:id", verifyJWT, updateExam);
router.delete("/:id", verifyJWT, deleteExam);

export default router;
