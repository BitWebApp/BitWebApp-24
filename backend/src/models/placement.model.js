import mongoose, { Schema } from "mongoose";

const placementSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required!"],
    },
    company: {
      type: String,
      required: [true, "Company name is required!"],
    },
    package: {
      type: Number,
      required: [true, "Package amount is required!"],
    },
    date: {
      type: Date,
      required: [true, "Placement date is required!"],
    },
    doc: {
      type: String,
      required: [true, "Add supporting docs!"],
    },
  },
  { timestamps: true }
);

export const Placement = mongoose.model("Placement", placementSchema);
