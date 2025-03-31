import express from "express";
import { getChat } from "../controllers/chat.controller.js";
import { verifyJWT, verifyProfessor } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/user/:groupId", verifyJWT, getChat);
router.get("/prof/:groupId", verifyProfessor, getChat);

export default router;

