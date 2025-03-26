import express from 'express';
import { createBug, getBugs, getBugById, updateBug } from '../controllers/bugtracker.controller.js';
import { verifyJWT, verifyAdmin, verifyProfessor } from '../middlewares/auth.middleware.js';
import { createRateLimiter, requestIpMiddleware } from '../middlewares/ratelimiter.middleware.js';
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();
const bugRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });

router.post(
  '/bugs',
  requestIpMiddleware,
  bugRateLimiter,
  (req, res, next) => {
    verifyJWT(req, res, (err) => {
      if (!err) {
        return next();
      }
      
      verifyProfessor(req, res, (err2) => {
        if (!err2) {
          req.user = req.professor || req.user;
          return next();
        }
        return res.status(403).json({ message: "Authentication failed." });
      });
    });
  },
  upload.array("files"),
  createBug
);

router.get('/bugs', requestIpMiddleware, bugRateLimiter, verifyAdmin, getBugs);
router.get('/bugs/:id', requestIpMiddleware, bugRateLimiter, verifyAdmin, getBugById);
router.put('/bugs/:id', requestIpMiddleware, bugRateLimiter, verifyAdmin, updateBug);

export default router;
