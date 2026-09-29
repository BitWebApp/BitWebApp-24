import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  createAlumni,
  getAlumniStatus,
  addWorkExperience,
  deleteWorkExperience,
  getWorkExperiences,
  getAllAlumni,
  getAlumniBatches,
  sendDonationEmail,
  getAlumniProfile,
  getAlumniReport,
  getAlumniSummary,
  updateAlumniProfile,
} from "../controllers/alumni.controller.js";

const router = Router();

// Admin routes
router.get("/all", verifyAdmin, getAllAlumni);
router.get("/batches", verifyAdmin, getAlumniBatches);
router.get("/report", verifyAdmin, getAlumniReport);

// Alumni routes
router.get("/summary", verifyJWT, getAlumniSummary);
router.post("/create", verifyJWT, createAlumni);
router.patch("/update", verifyJWT, updateAlumniProfile);
router.get("/status", verifyJWT, getAlumniStatus);
router.post("/work-experience", verifyJWT, addWorkExperience);
router.get("/work-experience", verifyJWT, getWorkExperiences);
router.delete("/work-experience/:id", verifyJWT, deleteWorkExperience);
router.post("/donate", verifyJWT, sendDonationEmail);
router.get("/me", verifyJWT, getAlumniProfile);

export default router;
