import { Router } from "express";
import {
  verifyJWT,
  verifyAdmin,
  verifyProfessor,
} from "../middlewares/auth.middleware.js";
import {
  createProject1,
  addMember,
  acceptReq,
  getReq,
  removeMember,
  leaveGroup,
  applyToFaculty,
  withdrawPreferences,
  getProject1,
  getAppliedProfs,
  getDiscussionByStudent,
  getProject1AppliedStudents,
  acceptProject1Student,
  denyProject1Student,
  getProject1AcceptedStudents,
  addProject1Remark,
  addProject1Marks,
  getProject1Limits,
  saveProject1Title,
  getAllProject1Data,
} from "../controllers/project1.controller.js";

const router = Router();

// Student routes — group management
router.route("/create").post(verifyJWT, createProject1);
router.route("/add-member").post(verifyJWT, addMember);
router.route("/accept-req").post(verifyJWT, acceptReq);
router.route("/get-req").get(verifyJWT, getReq);
router.route("/remove-member").post(verifyJWT, removeMember);
router.route("/leave-group").post(verifyJWT, leaveGroup);

// Student routes — faculty application
router.route("/apply-faculty").post(verifyJWT, applyToFaculty);
router.route("/withdraw-preferences").post(verifyJWT, withdrawPreferences);
router.route("/get-project1").get(verifyJWT, getProject1);
router.route("/get-app-profs").get(verifyJWT, getAppliedProfs);
router.route("/get-disc-student").get(verifyJWT, getDiscussionByStudent);

// Professor routes
router.route("/get-applied-students").get(verifyProfessor, getProject1AppliedStudents);
router.route("/accept-student").post(verifyProfessor, acceptProject1Student);
router.route("/deny-student").post(verifyProfessor, denyProject1Student);
router.route("/get-accepted-students").get(verifyProfessor, getProject1AcceptedStudents);
router.route("/add-remark").post(verifyProfessor, addProject1Remark);
router.route("/add-marks").post(verifyProfessor, addProject1Marks);
router.route("/get-limit").get(verifyProfessor, getProject1Limits);
router.route("/save-project-title").post(verifyProfessor, saveProject1Title);

// Admin routes
router.route("/get-all").get(verifyAdmin, getAllProject1Data);

export default router;
