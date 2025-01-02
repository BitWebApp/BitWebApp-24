import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    building: {
      type: String,
      required: [true, "Building is required"],
    },
    classroomNumber: {
      type: String,
      required: [true, "Classroom number is required"],
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    startTime: {
      type: String, // Format: "HH:MM" (24-hour clock)
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:MM"
      required: true,
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const ClassroomBooking = mongoose.model("ClassroomBooking", bookingSchema);
