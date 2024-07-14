import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { addBacklogbyUser, getAllBacklogSubjects, addbacklogSubject, getBacklogsbyUser } from "../controllers/backlog.controller.js";

const router = Router();
router.post("/add-subj", verifyAdmin, addbacklogSubject)
router.post("/add-backlog", verifyJWT, addBacklogbyUser);
router.get("/get-subj", verifyJWT, getAllBacklogSubjects)
router.get("/get-backlog-user", verifyJWT, getBacklogsbyUser)
export default router;