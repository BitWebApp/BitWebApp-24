import { Router } from "express";
import {
  createBatchAdmin,
  deleteAdmin,
  getAllAdmins,
  getAllMajorProjects,
  getAllMinorProjects,
  getBatchStats,
  getCurrendAdmin,
  getUnverifiedUsers,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  rejectUser,
  updateAdmin,
  verifyUser,
} from "../controllers/admin.controller.js";
import { addbacklogSubject } from "../controllers/backlog.controller.js";
import { verifyAdmin, verifyMasterAdmin } from "../middlewares/auth.middleware.js";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  addCompany,
  assignCompany,
  getAllCompanies,
} from "../controllers/company.controller.js";
const router = Router();

/**
 * Bootstrap guard middleware - allows registration only when no admins exist.
 * This prevents unauthorized admin creation after initial setup.
 */
const bootstrapGuard = asyncHandler(async (req, res, next) => {
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    throw new ApiError(403, "Admin registration is disabled. Please contact an existing admin.");
  }
  next();
});

// Public routes
router.route("/register").post(bootstrapGuard, registerAdmin);
router.route("/login").post(loginAdmin);

// Protected routes (any admin)
router.route("/unverifiedUsers").get(verifyAdmin, getUnverifiedUsers);
router.route("/verifyUser").patch(verifyAdmin, verifyUser);
router.route("/logout").post(verifyAdmin, logoutAdmin);
router.route("/get-admin").get(verifyAdmin, getCurrendAdmin);
router.route("/add-backlog").post(verifyAdmin, addbacklogSubject);
router.route("/rejectUser").patch(verifyAdmin, rejectUser);
router.route("/add-company").post(verifyAdmin, addCompany);
router.route("/get-companies").get(getAllCompanies);
router.route("/assign-company").post(verifyAdmin, assignCompany);
router.route("/get-minor-projects").get(verifyAdmin, getAllMinorProjects);
router.route("/get-major-projects").get(verifyAdmin, getAllMajorProjects);
router.route("/batch-stats").get(verifyAdmin, getBatchStats);

// Master admin only routes
router.route("/admins").get(verifyMasterAdmin, getAllAdmins);
router.route("/admins/create").post(verifyMasterAdmin, createBatchAdmin);
router.route("/admins/:adminId").patch(verifyMasterAdmin, updateAdmin);
router.route("/admins/:adminId").delete(verifyMasterAdmin, deleteAdmin);

export default router;
