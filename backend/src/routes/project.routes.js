import { Router } from "express";
import { createProject,ShowProject,deleteProject,editProject,showProjectById } from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/projectCreate").post(verifyJWT,upload.fields([{name:"projectId",maxcount:1}]),createProject);
router.get("/projectshowing",verifyJWT,ShowProject);
router.delete("/delete",verifyJWT,deleteProject)
router.put("/edit",verifyJWT,upload.fields([{name:"projectId",maxcount:1}]),editProject);
router.get("/show",verifyJWT,showProjectById);

export default router;