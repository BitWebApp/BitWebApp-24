import { Router } from "express";
import { 
    createGroup, addMember, removeMember, applyToFaculty, getGroup,
    getAppliedProfs,
    summerSorted, acceptReq, getReq, addDiscussion, addRemarkAbsent, getDiscussion,
    getDiscussionByStudent
} from "../controllers/group.controller.js";
import { verifyAdmin, verifyJWT, verifyProfessor } from "../middlewares/auth.middleware.js";

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
export default router;
