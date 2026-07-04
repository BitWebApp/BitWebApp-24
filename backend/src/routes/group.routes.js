import { Router } from "express";
import {
  createGroup,
  addMember,
  removeMember,
  applyToFaculty,
  getGroup,
  getAppliedProfs,
  summerSorted,
  acceptReq,
  getReq,
  addDiscussion,
  addRemarkAbsent,
  getDiscussion,
  getDiscussionByStudent,
  addMarks,
  leaveGroup,
  joinGroupByCode,
  requestSummerTypeChange,
  getSummerTypeChangeStatus,
  getMemberCompanies,
  profApproveSummerTypeChange,
  getSummerPendingTypeChanges,
} from "../controllers/group.controller.js";
import {
  verifyAdmin,
  verifyJWT,
  verifyProfessor,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-group").post(verifyJWT, createGroup);
router.route("/add-member").post(verifyJWT, addMember);
router.route("/remove-member").post(verifyJWT, removeMember);
router.route("/apply-faculty").post(verifyJWT, applyToFaculty);
router.route("/get-group").get(verifyJWT, getGroup);
router.route("/get-app-profs").get(verifyJWT, getAppliedProfs);
router.route("/summer").get(verifyJWT, summerSorted);
router.route("/accept-req").post(verifyJWT, acceptReq);
router.route("/get-req").get(verifyJWT, getReq);

router.route("/add-discussion").post(verifyJWT, addDiscussion);
router.route("/add-remark").post(verifyProfessor, addRemarkAbsent);
router.route("/get-disc").post(verifyProfessor, getDiscussion);
router.route("/get-disc-student").post(verifyJWT, getDiscussionByStudent);
router.route("/give-marks").post(verifyProfessor, addMarks);

router.route("/leave-group").post(verifyJWT, leaveGroup);
router.route("/join-by-code").post(verifyJWT, joinGroupByCode);

// Summer type change approval flow
router.route("/request-summer-type-change").post(verifyJWT, requestSummerTypeChange);
router.route("/get-summer-type-change-status").get(verifyJWT, getSummerTypeChangeStatus);
router.route("/get-member-companies").get(verifyJWT, getMemberCompanies);
router.route("/prof-approve-summer-type-change").post(verifyProfessor, profApproveSummerTypeChange);
router.route("/summer/pending-type-changes").get(verifyProfessor, getSummerPendingTypeChanges);

export default router;
