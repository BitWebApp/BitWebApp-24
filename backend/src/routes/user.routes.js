import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUser1,
  updatePlacementOne,
  updatePlacementTwo,
  updatePlacementThree,
  getPlacementDetails,
  getCurrentUser,
  getUserbyRoll,
  getPlacementOne,
  getPlacementTwo,
  getPlacementThree,
  getAllUsers,
  verifyMail,
  fetchBranch,
  otpForgotPass,
  changepassword,
} from "../controllers/user.controller.js";

import { applyToSummer } from "../controllers/professor.controller.js";
import {
  addInterviewExp,
  getAllInterviewExps,
} from "../controllers/interview.controller.js";
import { getUserCompanies } from "../controllers/company.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

import { getAllBacklogSubjects } from "../controllers/backlog.controller.js";
import {
  createRateLimiter,
  requestIpMiddleware,
} from "../middlewares/ratelimiter.middleware.js";

const router = Router();
router.route("/verifyMail").post(verifyMail);

router
  .route("/register")
  .post(upload.fields([{ name: "idCard", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update").patch(
  verifyJWT,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateUser1
);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router
  .route("/pone")
  .patch(
    verifyJWT,
    upload.fields([{ name: "doc", maxCount: 1 }]),
    updatePlacementOne
  );
router.route("/getbyroll").post(getUserbyRoll);
router
  .route("/ptwo")
  .patch(
    verifyJWT,
    upload.fields([{ name: "doc", maxCount: 1 }]),
    updatePlacementTwo
  );
router
  .route("/pthree")
  .patch(
    verifyJWT,
    upload.fields([{ name: "doc", maxCount: 1 }]),
    updatePlacementThree
  );

router.route("/fetchBranch").get(verifyJWT, fetchBranch);
router.route("/placementDetails").get(verifyAdmin, getPlacementDetails);
router.route("/placementOne").get(verifyJWT, getPlacementOne);
router.route("/placementTwo").get(verifyJWT, getPlacementTwo);
router.route("/placementThree").get(verifyJWT, getPlacementThree);
router.route("/get-all-users").get(verifyAdmin, getAllUsers);
router.route("/get-backlogs").get(verifyJWT, getAllBacklogSubjects);
router.route("/get-pass-otp").post(otpForgotPass);
router.route("/changepass").post(changepassword);

//interview exp routes
router.route("/get-user-companies").get(verifyJWT, getUserCompanies);
router.route("/add-interview-exp").post(verifyJWT, addInterviewExp);
const reviewLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 25 });
router
  .route("/interview-experiences")
  .get(requestIpMiddleware, reviewLimiter, getAllInterviewExps);

//summer internship routes
router.route("/applyToSummer").post(verifyJWT, applyToSummer);
export default router;
