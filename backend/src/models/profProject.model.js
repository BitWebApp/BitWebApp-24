import mongoose, { Schema } from "mongoose";

const adhocProjectSchema = new Schema(
  {
    professor: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
      required: [true, "Professor reference is required!"],
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
      type: [String],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
    relevantLinks: {
      type: [String],
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

export const AdhocProject = mongoose.model("AdhocProject", adhocProjectSchema);
