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
  generateAutoLoginUrl,
  autoLoginProf,
  getAppliedGroups,
  selectSummerStudents,
  getcurrentProf,
  incrementLimit,
  getAcceptedStudents,
  denyGroup,
  acceptGroup,
  getLimits,
  addRemark,
  groupAttendance,
  acceptedGroups,
  mergeGroups,
  otpForgotPassword,
  changePassword,
  selectMinorStudents,
  getMinorLimits,
  denyMinorGroup,
  getMinorAppliedGroups,
  addMinorRemark,
  groupMinorAttendance,
  getMinorAcceptedStudents,
  acceptMinorGroup,
  mergeMinorGroups,
  acceptedMinorGroups,
  getMajorAppliedGroups,
  getMajorAcceptedStudents,
  denyMajorGroup,
  acceptMajorGroup,
  addMajorRemark,
  groupMajorAttendance,
  acceptedMajorGroups,
  mergeMajorGroups,
  getMajorLimits,
  selectMajorStudents,
  getPendingTypeChangeRequests,
} from "../controllers/professor.controller.js";

const router = Router();
router.route("/addprof").post(verifyAdmin, addProf);
router.route("/getProf").get(getProf);

router.route("/login").post(loginProf);
router.route("/logout").post(verifyProfessor, logoutProf);
router.route("/generate-auto-login").post(verifyAdmin, generateAutoLoginUrl);
router.route("/auto-login").post(autoLoginProf);

router.route("/getAppliedGroups").get(verifyProfessor, getAppliedGroups);

// Major project type change requests
router.route("/major/pending-type-changes").get(verifyProfessor, getPendingTypeChangeRequests);
router
  .route("/selectSummerStudents")
  .post(verifyProfessor, selectSummerStudents);

router.route("/getcurrentProf").get(verifyProfessor, getcurrentProf);

router.route("/incrementLimit").post(verifyAdmin, incrementLimit);

router.route("/getAcceptedStudents").get(verifyProfessor, getAcceptedStudents);

router.route("/deny-group").post(verifyProfessor, denyGroup);
router.route("/accept-group").post(verifyProfessor, acceptGroup);
router.route("/add-remark").post(verifyProfessor, addRemark);
router.route("/meet-attend").post(verifyProfessor, groupAttendance);
router.route("/forgot-pass").post(otpForgotPassword);
router.route("/change-pass").post(changePassword);
router.route("/accepted-groups").get(verifyProfessor, acceptedGroups);
router.route("/merge-groups").post(verifyProfessor, mergeGroups);
router.route("/get-limit").get(verifyProfessor, getLimits);

router.route("/minor/getAppliedGroups").get(verifyProfessor, getMinorAppliedGroups);
router
  .route("/minor/selectMinorStudents")
  .post(verifyProfessor, selectMinorStudents);

router.route("/minor/getcurrentProf").get(verifyProfessor, getcurrentProf);

router.route("/incrementLimit").post(verifyAdmin, incrementLimit);

router.route("/minor/getAcceptedStudents").get(verifyProfessor, getMinorAcceptedStudents);

router.route("/minor/deny-group").post(verifyProfessor, denyMinorGroup);
router.route("/minor/accept-group").post(verifyProfessor, acceptMinorGroup);
router.route("/minor/add-remark").post(verifyProfessor, addMinorRemark);
router.route("/minor/meet-attend").post(verifyProfessor, groupMinorAttendance);
router.route("/minor/accepted-groups").get(verifyProfessor, acceptedMinorGroups);
router.route("/minor/merge-groups").post(verifyProfessor, mergeMinorGroups);
router.route("/minor/get-limit").get(verifyProfessor, getMinorLimits);

router.route("/major/getAppliedGroups").get(verifyProfessor, getMajorAppliedGroups);
router
  .route("/major/selectMinorStudents")
  .post(verifyProfessor, selectMajorStudents);

router.route("/major/getcurrentProf").get(verifyProfessor, getcurrentProf);

router.route("/major/getAcceptedStudents").get(verifyProfessor, getMajorAcceptedStudents);

router.route("/major/deny-group").post(verifyProfessor, denyMajorGroup);
router.route("/major/accept-group").post(verifyProfessor, acceptMajorGroup);
router.route("/major/add-remark").post(verifyProfessor, addMajorRemark);
router.route("/major/meet-attend").post(verifyProfessor, groupMajorAttendance);
router.route("/major/accepted-groups").get(verifyProfessor, acceptedMajorGroups);
router.route("/major/merge-groups").post(verifyProfessor, mergeMajorGroups);
router.route("/major/get-limit").get(verifyProfessor, getMajorLimits);
export default router;
