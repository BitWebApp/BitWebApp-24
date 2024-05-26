import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAward, getAwards, getAllAwards, getAwardById, updateAward, deleteAward } from "../controllers/awards.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", verifyJWT, upload.single('doc'), createAward);
router.get("/", verifyJWT, getAwards);
router.get("/all", verifyJWT, getAllAwards);
router.get("/:id", verifyJWT, getAwardById);
router.put("/:id", verifyJWT, upload.single('doc'), updateAward);
router.delete("/:id", verifyJWT, deleteAward);

export default router;