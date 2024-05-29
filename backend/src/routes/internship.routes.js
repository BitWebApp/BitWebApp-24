import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addInternDocs, addInternship, getAllInternshipData, getInternshipDataforStudent } from "../controllers/internship.controller.js";
const router = Router()
router.route("/addinternship").post(verifyJWT, upload.single("doc"), addInternship)
router.route("/addinterndocs").post(verifyJWT, addInternDocs)
router.route("/get-all-interns").post(verifyJWT, getAllInternshipData)
router.route("/get-internship-for-student").post(verifyJWT, getInternshipDataforStudent)

export default router;