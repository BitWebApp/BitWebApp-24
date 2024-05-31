import mongoose, { Schema } from "mongoose";

const internshipSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: String,
      uppercase: true,
      required: [true, "Company name is required!"],
    },
    role: {
      type: String,
      uppercase: true,
      required: [true, "Role is required!"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
    doc: {
      type: String,
      required: [true, "Add supporting docs!"],
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Internship = mongoose.model("Internship", internshipSchema);
