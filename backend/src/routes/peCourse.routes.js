import express from 'express';
import { addPeCourse, getAllPeCourses, getUserPeCourses } from '../controllers/peCourse.controller.js';
import { verifyJWT,verifyAdmin } from '../middlewares/auth.middleware.js'; // Middleware for authentication

const router = express.Router();

router.post('/add-pe', verifyJWT, addPeCourse);
router.get('/get-all', verifyAdmin, getAllPeCourses);
router.get('/my-pe-courses', verifyJWT, getUserPeCourses);

export default router;