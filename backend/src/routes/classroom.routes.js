import express from "express";
import {
  createBookingRequest,
  getStudentBookings,
  getPendingBookings, 
  updateBookingStatus,
  getApprovedBookings,
  getRejectedBookings,
} from "../controllers/classroom.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Student routes
router.post("/", verifyJWT, createBookingRequest); // Submit booking request
router.get("/student", verifyJWT, getStudentBookings); // View student's booking requests
router.get("/allBookings", verifyJWT, getApprovedBookings);

// Admin routes
// Get all pending bookings
router.get("/bookings/pending", verifyAdmin, getPendingBookings);
// Approve a booking
router.put("/bookings/:id/approve", verifyAdmin, (req, res) => updateBookingStatus(req, res, "Approved"));
// Reject a booking
router.put("/bookings/:id/reject", verifyAdmin, (req, res) => updateBookingStatus(req, res, "Rejected"));
// Get all approved bookings
router.get("/bookings/approved", verifyAdmin, getApprovedBookings);
// Get all rejected bookings
router.get("/bookings/rejected", verifyAdmin, getRejectedBookings);

export default router;
