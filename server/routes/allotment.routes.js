import { Router } from "express";
import {
  createBackPaperAllotment,
  deleteAllotment,
  findStudentForAllotment,
  getAllotmentOptions,
  getMyAllotments,
  listAllotments,
  setAllotmentMarks,
} from "../controllers/allotment.controller.js";
import {
  verifyAdmin,
  verifyProfessor,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Admins and batch coordinators (scoped to their batches)
router.route("/admin/options").get(verifyAdmin, getAllotmentOptions);
router.route("/admin/student").get(verifyAdmin, findStudentForAllotment);
router.route("/admin/list").get(verifyAdmin, listAllotments);
router.route("/admin/back-paper").post(verifyAdmin, createBackPaperAllotment);
router.route("/admin/:id").delete(verifyAdmin, deleteAllotment);

// Mentors
router.route("/mine").get(verifyProfessor, getMyAllotments);
router.route("/:id/marks").post(verifyProfessor, setAllotmentMarks);

export default router;
