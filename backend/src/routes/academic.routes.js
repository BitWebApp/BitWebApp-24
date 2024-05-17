import { Router } from "express";
import { 
  createAcademicRecord, 
  getStudentAcademicRecords,
  updateAcademicRecords, 
  deleteAcademicRecord,
} from "../controllers/academic.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createAcademicRecord);
router.route("/studentRecords").get(verifyJWT, getStudentAcademicRecords);
router.route("/update/:id").patch(verifyJWT, updateAcademicRecords);
router.route("/delete/:id").delete(verifyJWT, deleteAcademicRecord);

export default router;
