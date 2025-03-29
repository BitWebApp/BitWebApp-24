import { Router } from "express";
import { addReview, addReviewByProfessor, getReviews } from "../controllers/review.controller.js";
import { verifyAdmin, verifyJWT, verifyProfessor } from "../middlewares/auth.middleware.js";
import {
  createRateLimiter,
  requestIpMiddleware,
} from "../middlewares/ratelimiter.middleware.js";

const router = Router();

const reviewLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

router.route("/reviews").post(requestIpMiddleware, reviewLimiter, addReview);
router.route("/reviews").get(verifyAdmin, getReviews);
router.route("/review-professor").post(verifyProfessor, addReviewByProfessor);
export default router;
