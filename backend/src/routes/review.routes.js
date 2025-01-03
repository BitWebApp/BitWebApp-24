import { Router } from "express";
import { addReview, getReviews } from "../controllers/review.controller.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRateLimiter,
  requestIpMiddleware,
} from "../middlewares/ratelimiter.middleware.js";

const router = Router();

const reviewLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

router.route("/reviews").post(requestIpMiddleware, reviewLimiter, addReview);
router.route("/reviews").get(verifyAdmin, getReviews);

export default router;
