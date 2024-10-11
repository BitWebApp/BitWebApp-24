import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  getUnverifiedUsers,
  loginAdmin,
  registerAdmin,
  verifyUser,
  logoutAdmin,
  getCurrendAdmin,
  rejectUser
} from "../controllers/admin.controller.js";
import { addbacklogSubject } from "../controllers/backlog.controller.js";
const router = Router();

router.route("/unverifiedUsers").get(verifyAdmin, getUnverifiedUsers);

router.route("/verifyUser").patch(verifyAdmin, verifyUser);

router.route("/register").post(registerAdmin);

router.route("/login").post(loginAdmin);

router.route("/logout").post(verifyAdmin, logoutAdmin);

router.route("/get-admin").get(verifyAdmin, getCurrendAdmin);

router.route("/add-backlog").post(verifyAdmin, addbacklogSubject);
router.route("/rejectUser").patch(verifyAdmin, rejectUser);
export default router;
