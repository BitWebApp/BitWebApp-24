import { ClassroomBooking } from "../models/classroom.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

// Submit a classroom booking request
export const createBookingRequest = asyncHandler(async (req, res) => {
  const { building, classroomNumber, bookingDate, startTime, endTime, purpose } = req.body;

  const userId = req.user._id; 
  // console.log("Request", req);
  
  // Validate required fields
  if (!userId || !building || !classroomNumber || !bookingDate || !startTime || !endTime || !purpose) {
    throw new ApiError(400, "All fields are required.");
  }

  // Check for existing overlapping booking requests
  const overlappingBooking = await ClassroomBooking.findOne({
    building,
    classroomNumber,
    bookingDate,
    status: { $in: ["Pending", "Approved"] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  });

  if (overlappingBooking) {
    throw new ApiError(400, "This time slot is already booked or pending approval.");
  }

  // Create booking request
  const booking = await ClassroomBooking.create({
    student: req.user._id,
    rollNumber: req.user.rollNumber,
    building,
    classroomNumber,
    bookingDate,
    startTime,
    endTime,
    purpose,
    status: "Pending",
  });

  res.status(201).json(new ApiResponse(201, booking, "Booking request submitted successfully."));
});

// Get a student's booking requests
export const getStudentBookings = asyncHandler(async (req, res) => {
  const bookings = await ClassroomBooking.find({ student: req.user._id });

  res
    .status(200)
    .json(new ApiResponse(200, bookings, "Student booking requests fetched successfully."));
});

// Fetch all pending bookings
export const getPendingBookings = async (req, res) => {
  try {
    const bookings = await ClassroomBooking.find({ status: "Pending" }).populate("student", "fullName rollNumber");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending bookings", error });
  }
};

// Update booking status to Approved or Rejected
export const updateBookingStatus = async (req, res, newStatus) => {
  try {
    const { id } = req.params;
    const booking = await ClassroomBooking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = newStatus;
    await booking.save();

    res.status(200).json({ message: `Booking ${newStatus}`, booking });
  } catch (error) {
    res.status(500).json({ message: `Error updating booking status`, error });
  }
};

// Fetch all approved bookings
export const getApprovedBookings = async (req, res) => {
  try {
    const bookings = await ClassroomBooking.find({ status: "Approved" }).populate("student", "fullName rollNumber");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching approved bookings", error });
  }
};

// Fetch all rejected bookings
export const getRejectedBookings = async (req, res) => {
  try {
    const bookings = await ClassroomBooking.find({ status: "Rejected" }).populate("student", "fullName rollNumber");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rejected bookings", error });
  }
};