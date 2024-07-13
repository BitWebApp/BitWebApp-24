import { Router } from "express";
import { 
  addReview, 
  getReviews 
} from '../controllers/review.controller.js';
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/reviews').post(addReview)
router.route('/reviews').get(verifyAdmin, getReviews)

export default router;
