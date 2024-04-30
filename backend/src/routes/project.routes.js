import { Router } from "express";
import { createProject,ShowProject } from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/projectCreate").post(verifyJWT,upload.fields([{name:"projectId",maxcount:1}]),createProject);
router.route("/ProjectShowing").post(verifyJWT,ShowProject);

export default router;