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
  rejectUser,
  getAllMinorProjects
} from "../controllers/admin.controller.js";
import { addbacklogSubject } from "../controllers/backlog.controller.js";

import {
  addCompany,
  getAllCompanies,
  assignCompany,
} from "../controllers/company.controller.js";
const router = Router();

router.route("/unverifiedUsers").get(verifyAdmin, getUnverifiedUsers);
router.route("/verifyUser").patch(verifyAdmin, verifyUser);
router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/logout").post(verifyAdmin, logoutAdmin);
router.route("/get-admin").get(verifyAdmin, getCurrendAdmin);
router.route("/add-backlog").post(verifyAdmin, addbacklogSubject);
router.route("/rejectUser").patch(verifyAdmin, rejectUser);
router.route("/add-company").post(verifyAdmin, addCompany);
router.route("/get-companies").get(getAllCompanies);
router.route("/assign-company").post(verifyAdmin, assignCompany);
router.route("/get-minor-projects").get(verifyAdmin, getAllMinorProjects);

export default router;
