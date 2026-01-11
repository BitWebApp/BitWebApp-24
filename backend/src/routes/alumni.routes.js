import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  createAlumni,
  getAlumniStatus,
  addWorkExperience,
  getWorkExperiences,
  getAllAlumni,
  sendDonationEmail,
  getAlumniProfile,
} from "../controllers/alumni.controller.js";

const router = Router();

// Admin routes
router.get("/all", verifyAdmin, getAllAlumni);

// Alumni routes
router.post("/create", verifyJWT, createAlumni);
router.get("/status", verifyJWT, getAlumniStatus);
router.post("/work-experience", verifyJWT, addWorkExperience);
router.get("/work-experience", verifyJWT, getWorkExperiences);
router.post("/donate", verifyJWT, sendDonationEmail);
router.get("/me", verifyJWT, getAlumniProfile);

export default router;
