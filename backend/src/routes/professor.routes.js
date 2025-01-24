import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyJWT,
  verifyAdmin,
  verifyProfessor,
} from "../middlewares/auth.middleware.js";
import {
  addProf,
  getProf,
  loginProf,
  logoutProf,
  getAppliedStudents,
  selectSummerStudents,
} from "../controllers/professor.controller.js";
// import { verify } from "jsonwebtoken";
const router = Router();
router.route("/addprof").post(verifyAdmin, addProf);
router.route("/getProf").get(verifyJWT, getProf);

router.route("/login").post(loginProf);
router.route("/logout").post(verifyProfessor, logoutProf);

router.route("/getAppliedStudents").get(verifyProfessor, getAppliedStudents);
router
  .route("/selectSummerStudents")
  .post(verifyProfessor, selectSummerStudents);

export default router;
