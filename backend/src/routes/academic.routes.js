import { Router } from "express";
import { 
  createAcademicRecord, 
  getAcademicRecords, 
  updateAcademicRecords, 
  deleteAcademicRecord
} from "../controller/aca.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/academic/create").post(verifyJWT, createAcademicRecord);
router.route("/academic/records").get(verifyJWT, getAcademicRecords);
router.route("/academic/update/:id").patch(verifyJWT, updateAcademicRecords);
router.route("/academic/update/:id").delete(verifyJWT, deleteAcademicRecord);

export default router;
