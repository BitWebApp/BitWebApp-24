import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  addProf, getProf
} from "../controllers/professor.controller.js";
const router = Router();
router
  .route("/addprof")
  .post(verifyAdmin, addProf);
router.route("/getProf").get(verifyJWT, getProf);

export default router;
