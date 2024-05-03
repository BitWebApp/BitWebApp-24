import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addAward, getAwardByStudentId } from "../controllers/awards.controller.js";
const router = Router()
router.route("/addaward").post(verifyJWT, addAward)
router.route("/getawardbyId").post(verifyJWT, getAwardByStudentId)