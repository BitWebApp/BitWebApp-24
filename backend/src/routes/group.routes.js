import { Router } from "express";
import { 
    createGroup, addMember, removeMember, applyToFaculty, getGroup
} from "../controllers/group.controller.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-group").post(verifyJWT, createGroup);
router.route("/add-member").post(verifyJWT, addMember);
router.route("/remove-member").post(verifyJWT, removeMember);
router.route("/apply-faculty").post(verifyJWT, applyToFaculty);
router.route("/get-group").get(verifyJWT, getGroup);
export default router;
