import { Router } from "express";
import {
  archiveBatch,
  listBatches,
  unarchiveBatch,
} from "../controllers/batch.controller.js";
import { verifyMasterAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(listBatches);
router.route("/archive").post(verifyMasterAdmin, archiveBatch);
router.route("/unarchive").post(verifyMasterAdmin, unarchiveBatch);

export default router;
