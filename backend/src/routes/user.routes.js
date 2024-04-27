import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUser1,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router
  .route("/register")
  .post(upload.fields([{ name: "idCard", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update").patch(verifyJWT, updateUser1);
export default router;
