import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUnverifiedUsers,
  verifyUser,
} from "../controllers/admin.controller.js";
const router = Router();

router.route("/unverifiedUsers").get(verifyJWT, getUnverifiedUsers);

router.route("/verifyUser").patch(verifyJWT, verifyUser);
export default router;
