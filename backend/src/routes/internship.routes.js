import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  addInternDocs,
  addInternship,
  getAllInternshipData,
  getAllVerifiedInternshipData,
  getInternshipDataforStudent,
  verifyIntern,
} from "../controllers/internship.controller.js";
const router = Router();
router
  .route("/addinternship")
  .post(verifyJWT, upload.single("doc"), addInternship);
router.route("/addinterndocs").post(verifyJWT, addInternDocs);
router.route("/get-all-interns").get(verifyJWT, getAllInternshipData);
router
  .route("/get-internship-for-student")
  .post(verifyJWT, getInternshipDataforStudent);
router.route("/verify-intern").post(verifyJWT, verifyIntern);
router
  .route("/get-verified-interns")
  .get(verifyAdmin, getAllVerifiedInternshipData);

export default router;
