import { Router } from "express";
import { createHigherEducation, 
  getHigherEducations,
  getAllHigherEducations,
  getHigherEducationById,
  updateHigherEducation,
  deleteHigherEducation } from "../controllers/higher-education.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, upload.array('files'), createHigherEducation);
router.get("/", verifyJWT, getHigherEducations);
router.get("/all", verifyAdmin, getAllHigherEducations); 
router.get("/:id", verifyJWT, getHigherEducationById);
router.put("/:id", verifyJWT, upload.array('files'), updateHigherEducation);
router.delete("/:id", verifyJWT, deleteHigherEducation);

export default router;
