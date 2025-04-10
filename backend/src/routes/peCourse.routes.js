import express from 'express';
import { addPeCourse, getAdminPeCourses, getUserPeCourses } from '../controllers/peCourse.controller.js';
import { verifyJWT,verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/add-pe', verifyJWT, (req, res, next) => {
    addPeCourse(req, res, next);
  });
  router.get('/get-all', verifyAdmin, getAdminPeCourses);
router.get('/my-pe-courses', verifyJWT, getUserPeCourses);

export default router;