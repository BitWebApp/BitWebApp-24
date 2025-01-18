import mongoose, { Schema } from "mongoose";

const profProjectSchema = new Schema(
  {
    profId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "profId is required!"],
    },
    profName: {
        type: String,
        required: [true, "prof name is required!"],
    },
    profEmail: {
        type: String,
        required: [true, "prof email is required!"],
    },
    title: {
      type: String,
      required: [true, "title is required!"],
    },
    desc: {
      type: String,
      required: [true, "desc is required!"],
    },
    categories: {
      type: [String]
    },
    startDate: {
      type: Date,
      required: [true, "Placement date is required!"],
    },
    endDate: {
        type: Date,
        required: [true, "Placement date is required!"],
    },
    relevantLinks: {
        type: [String]
    },
    doc: {
      type: [String],
    },
    closed: { 
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ProfProject = mongoose.model("ProfProject", profProjectSchema);