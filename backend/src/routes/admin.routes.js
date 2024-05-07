import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUnverifiedUsers } from "../controllers/admin.controller.js";
const router = Router();

router.route("/unverifiedUsers").get(verifyJWT, getUnverifiedUsers);
export default router;
