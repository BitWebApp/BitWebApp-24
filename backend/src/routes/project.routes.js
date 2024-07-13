import { Router } from "express";
import { createProject,ShowProject,deleteProject,editProject,showProjectById } from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/projectCreate").post(verifyJWT,upload.fields([{name:"projectId",maxcount:1}]),createProject);
router.get("/projectshowing",verifyAdmin,ShowProject);
router.delete("/delete/:id",verifyAdmin,deleteProject)
router.put("/edit",verifyAdmin,upload.fields([{name:"projectId",maxcount:1}]),editProject);
router.get("/show",verifyAdmin,showProjectById);

export default router;