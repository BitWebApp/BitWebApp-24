import mongoose, { Schema } from "mongoose";
const InterviewExpSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      required: [true, "Role is required!"],
    },
    interviewYear: {
      type: String,
    },
    cgpa: {
      type: String,
    },
    ctc: {
      type: String,
    },
    stipend: {
      type: String,
    },
    experience: {
      type: [String],
    },
    referenceMaterialLinks: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);
