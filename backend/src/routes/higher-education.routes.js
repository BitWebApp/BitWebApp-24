import { Router } from "express";
import {
  createHigherEducation,
  getHigherEducations,
  getHigherEducationById,
  updateHigherEducation,
  deleteHigherEducation,
} from "../controllers/higher-education.controller.js";
// import { uploadMultiple } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.post("/", verifyJWT, uploadMultiple, createHigherEducation);
router.get("/", verifyJWT, getHigherEducations);
router.get("/:id", verifyJWT, getHigherEducationById);
router.put("/:id", verifyJWT, updateHigherEducation);
router.delete("/:id", verifyJWT, deleteHigherEducation);

export default router;
