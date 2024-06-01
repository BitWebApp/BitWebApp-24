import { Router } from "express";
import { 
  createAcademicRecord, 
  getStudentAcademicRecords,
  updateAcademicRecords, 
  deleteAcademicRecord,
  getAdminAcademicRecords,
} from "../controllers/academic.controller.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createAcademicRecord);
router.route("/studentRecords").get(verifyJWT, getStudentAcademicRecords);
router.route("/update/:id").patch(verifyJWT, updateAcademicRecords);
router.route("/delete/:id").delete(verifyJWT, deleteAcademicRecord);
router.route("/adminRecords").get(verifyAdmin, getAdminAcademicRecords);

export default router;
