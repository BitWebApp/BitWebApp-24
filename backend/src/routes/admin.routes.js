import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUnverifiedUsers,
  loginAdmin,
  registerAdmin,
  verifyUser,
} from "../controllers/admin.controller.js";
const router = Router();

router.route("/unverifiedUsers").get(verifyJWT, getUnverifiedUsers);

router.route("/verifyUser").patch(verifyJWT, verifyUser);

router.route("/register").post(registerAdmin);

router.route("/login").post(loginAdmin);

export default router;
