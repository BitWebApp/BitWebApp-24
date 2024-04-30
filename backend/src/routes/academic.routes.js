import { Router } from "express";
import { 
  createAcademicRecord, 
  getAcademicRecords, 
  updateAcademicRecords, 
  deleteAcademicRecord
} from "../controllers/academic.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createAcademicRecord);
router.route("/records").get(verifyJWT, getAcademicRecords);
router.route("/update/:id").patch(verifyJWT, updateAcademicRecords);
router.route("/update/:id").delete(verifyJWT, deleteAcademicRecord);

export default router;
