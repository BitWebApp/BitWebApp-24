import { Router } from "express";
import { 
  createAcademicRecord, 
  getStudentAcademicRecords,
  getAdminAcademicRecords,
} from "../controllers/academic.controller.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createAcademicRecord);
router.route("/studentRecords").get(verifyJWT, getStudentAcademicRecords);
router.route("/adminRecords").get(verifyAdmin, getAdminAcademicRecords);
export default router;
