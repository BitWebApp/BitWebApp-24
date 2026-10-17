import mongoose, { Schema } from "mongoose";
import { ALLOTMENT_CATEGORIES, COURSE_VALUES } from "../utils/courses.js";
import { PROGRAM_VALUES } from "../utils/programs.js";
import { isValidSession } from "../utils/sessions.js";

/**
 * A mentor allotted to one student for one course in one session, outside
 * the group application flow: back paper students repeating a course, and
 * (bulk uploaded) MCA / M.Tech students.
 */
const allotmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
      required: [true, "Mentor is required"],
      index: true,
    },
    course: {
      type: String,
      enum: COURSE_VALUES,
      required: [true, "Course is required"],
    },
    session: {
      type: String,
      required: [true, "Session is required"],
      validate: {
        validator: isValidSession,
        message: "Session must look like MO2026 or SP2027",
      },
      index: true,
    },
    category: {
      type: String,
      enum: ALLOTMENT_CATEGORIES.map((c) => c.value),
      default: "regular",
    },
    // Copied from the student when allotted, so lists can be filtered and
    // scoped to a coordinator's batches without a join.
    program: {
      type: String,
      enum: PROGRAM_VALUES,
    },
    batch: {
      type: Number,
      index: true,
    },
    marks: {
      type: Number,
      default: null,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["manual", "bulk"],
      default: "manual",
    },
    allottedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// A student has at most one mentor per course per session.
allotmentSchema.index({ student: 1, course: 1, session: 1 }, { unique: true });

export const Allotment = mongoose.model("Allotment", allotmentSchema);
